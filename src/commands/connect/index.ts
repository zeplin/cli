import chalk from "chalk";
import chokidar from "chokidar";
import dedent from "ts-dedent";
import logger from "../../util/logger";
import path from "path";
import { indent } from "../../util/text";
import { getComponentConfigFiles } from "./config";
import { ConnectedBarrelComponents } from "./interfaces/api";
import { connectComponentConfigFiles } from "./plugin";
import { ConnectDevServer } from "./server";
import { ConnectedComponentsService } from "./service";

const getComponentFilePaths = (connectedBarrels: ConnectedBarrelComponents[]): string[] =>
    connectedBarrels.map(f =>
        f.connectedComponents.map(c => path.resolve(c.path))
    ).reduce((a, b) => [...a, ...b], []);

const connectComponents = async (options: Pick<ConnectOptions, "configFiles" | "plugins">): Promise<ConnectedBarrelComponents[]> => {
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
    options: Omit<ConnectOptions, "devMode">,
    connectedBarrels: ConnectedBarrelComponents[]
): Promise<void> => {
    const {
        configFiles,
        devModePort,
        devModeWatch
    } = options;

    logger.info("Starting development server…");

    const devServer = new ConnectDevServer(connectedBarrels);

    await devServer.start(devModePort);

    logger.info(chalk.green(`Development server is started.`));

    if (devModeWatch) {
        let componentFiles = getComponentFilePaths(connectedBarrels);

        const watcher = chokidar.watch(
            [...configFiles, ...componentFiles],
            {
                cwd: process.cwd(),
                persistent: true,
                awaitWriteFinish: true
            }
        );

        watcher.on("change", async filePath => {
            logger.info((chalk.yellow(`\nFile change detected ${filePath}.\n`)));

            try {
                const updatedConnectedBarrels = await connectComponents(options);

                watcher.unwatch(componentFiles);

                devServer.updateConnectedBarrels(updatedConnectedBarrels);

                componentFiles = getComponentFilePaths(updatedConnectedBarrels);

                watcher.add(componentFiles);
            } catch (error) {
                logger.error(chalk.red(dedent`
                    Could not update components.
                    ${error}
                `));
            }
        });
    }
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
