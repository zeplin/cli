import chalk from "chalk";
import chokidar from "chokidar";
import dedent from "ts-dedent";
import logger from "../../util/logger";
import path from "path";
import { indent, stringify } from "../../util/text";
import { getComponentConfigFiles } from "./config";
import { ConnectedBarrelComponents } from "./interfaces/api";
import { connectComponentConfigFiles } from "./plugin";
import { ConnectDevServer } from "./server";
import { ConnectedComponentsService } from "./service";

const getComponentFilePaths = (connectedBarrels: ConnectedBarrelComponents[]): string[] =>
    connectedBarrels.map(f =>
        f.connectedComponents.map(c => path.resolve(c.path))
    ).reduce((a, b) => [...a, ...b], []);

const generateConnectedComponents = async (
    options: Partial<Pick<ConnectOptions, "configFiles" | "plugins">>
): Promise<ConnectedBarrelComponents[]> => {
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
    options: Pick<ConnectOptions, "configFiles" | "devModePort" | "devModeWatch" | "plugins">,
    connectedBarrels: ConnectedBarrelComponents[]
): Promise<void> => {
    const {
        configFiles,
        devModePort,
        devModeWatch,
        plugins
    } = options;

    logger.info("Starting development server…");

    const devServer = new ConnectDevServer(connectedBarrels);

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
                const updatedConnectedBarrels = await generateConnectedComponents({ configFiles, plugins });

                watcher.unwatch(componentFiles);

                devServer.updateConnectedBarrels(updatedConnectedBarrels);

                componentFiles = getComponentFilePaths(updatedConnectedBarrels);

                watcher.add(componentFiles);
            } catch (error) {
                logger.error(chalk.red(dedent`
                    Could not update Connected Components.
                    ${error}
                `));
            }
        });
    }

    await devServer.listen(devModePort);
};

const service = new ConnectedComponentsService();

const upload = async (connectedBarrels: ConnectedBarrelComponents[]): Promise<void> => {
    logger.info("Connecting all Connected Components into Zeplin…");

    await service.uploadConnectedBarrels(connectedBarrels);

    logger.info("🦄 Components successfully connected to components in Zeplin.");
};

async function connect(options: ConnectOptions): Promise<void> {
    try {
        logger.debug(`connect options: ${stringify(options)}`);

        const connectedBarrels = await generateConnectedComponents(options);

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

export interface ConnectOptions {
    configFiles: string[];
    devMode: boolean;
    devModePort: number;
    devModeWatch: boolean;
    plugins: string[];
}

export {
    generateConnectedComponents,
    connect
};
