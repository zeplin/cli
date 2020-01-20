import chalk from "chalk";
import dedent from "ts-dedent";

import { getComponentConfigFiles } from "./config";
import { connectComponentConfigFiles } from "./plugin";
import { ConnectDevServer } from "./server";
import { ConnectedComponentsService } from "./service";
import { indent } from "../../util/text";
import logger from "../../util/logger";

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

        const {
            configFiles,
            plugins,
            devMode,
            devModePort
        } = options;

        const componentConfigFiles = await getComponentConfigFiles(configFiles, plugins);

        logger.debug(`component config files: ${JSON.stringify(componentConfigFiles)}`);

        const connectedBarrels = await connectComponentConfigFiles(componentConfigFiles);

        logger.debug(`connected barrels output: ${JSON.stringify(connectedBarrels)}`);

        if (devMode) {
            logger.info("Starting development server…");

            const devServer = new ConnectDevServer(connectedBarrels);

            await devServer.start(devModePort);

            logger.info(`Development server is started on port ${devModePort}!`);
        } else {
            logger.info("Connecting all connected components into Zeplin…");

            const service = new ConnectedComponentsService();

            await service.uploadConnectedBarrels(connectedBarrels);

            logger.info("🦄 Components successfully connected to components in Zeplin.");
        }
    } catch (error) {
        error.message = dedent`
            ${chalk.bold`Connecting components to Zeplin components failed.`}

            ${chalk.redBright(indent(error.message))}
        `;
        throw error;
    }
}
