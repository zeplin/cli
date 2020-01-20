import chalk from "chalk";
import dedent from "ts-dedent";
import logger from "../../util/logger";
import { indent } from "../../util/text";
import { getComponentConfigFiles } from "./config";
import { ConnectedBarrelComponents } from "./interfaces/api";
import { connectComponentConfigFiles } from "./plugin";
import { ConnectDevServer } from "./server";
import { ConnectedComponentsService } from "./service";

const connectComponents = async (options: ConnectOptions): Promise<ConnectedBarrelComponents[]> => {
    const {
        configFiles,
        plugins
    } = options;

    const componentConfigFiles = await getComponentConfigFiles(configFiles, plugins);

    logger.debug(`component config files: ${JSON.stringify(componentConfigFiles)}`);

    const connectedBarrels = await connectComponentConfigFiles(componentConfigFiles);

    logger.debug(`connected barrels output: ${JSON.stringify(connectedBarrels)}`);

    return connectedBarrels;
};

const startDevServer = async (
    options: ConnectOptions,
    connectedBarrels: ConnectedBarrelComponents[]
): Promise<void> => {
    const {
        devModePort
    } = options;

    logger.info("Starting development server…");

    const devServer = new ConnectDevServer(connectedBarrels);

    await devServer.start(devModePort);

    logger.info(chalk.green(`Development server is started on port ${devModePort}.`));
};

const upload = async (connectedBarrels: ConnectedBarrelComponents[]): Promise<void> => {
    logger.info("Connecting all connected components into Zeplin…");

    const service = new ConnectedComponentsService();

    await service.uploadConnectedBarrels(connectedBarrels);

    logger.info("🦄 Components successfully connected to components in Zeplin.");
};

export interface ConnectOptions {
    configFiles: string[];
    devMode: boolean;
    devModePort: number;
    devModeWatch: boolean;
    plugins: string[];
}

export async function connect(options: ConnectOptions): Promise<void> {
    try {
        logger.debug(`connect options: ${JSON.stringify(options)}`);

        const connectedBarrels = await connectComponents(options);

        if (options.devMode) {
            await startDevServer(options, connectedBarrels);
        } else {
            await upload(connectedBarrels);
        }
    } catch (error) {
        error.message = dedent`
            ${chalk.bold`Connecting components to Zeplin components failed.`}

            ${chalk.redBright(indent(error.message))}
        `;
        throw error;
    }
}
