import chalk from "chalk";
import dedent from "ts-dedent";

import { getComponentConfigFiles } from "./config";
import { connectComponentConfigFiles } from "./plugin";
import { ConnectDevServer } from "./server";
import { ConnectedComponentsService } from "./service";
import { indent } from "../../util/text";

export interface ConnectOptions {
    configFiles: string[];
    devMode: boolean;
    devModePort: number;
    plugins: string[];
}

export async function connect(options: ConnectOptions): Promise<void> {
    try {
        const {
            configFiles,
            plugins,
            devMode,
            devModePort
        } = options;

        const componentConfigFiles = await getComponentConfigFiles(configFiles, plugins);

        const connectedBarrels = await connectComponentConfigFiles(componentConfigFiles);

        if (devMode) {
            console.log("Starting development server…");

            const devServer = new ConnectDevServer(connectedBarrels);

            await devServer.start(devModePort);

            console.log(`Development server is started on port ${devModePort}!`);
        } else {
            console.log("Connecting all connected components into Zeplin…");

            const service = new ConnectedComponentsService();

            await service.uploadConnectedBarrels(connectedBarrels);

            console.log("🦄 Components successfully connected to components in Zeplin.");
        }
    } catch (error) {
        error.message = dedent`
            ${chalk.bold`Connecting components to Zeplin components failed.`}

            ${chalk.redBright(indent(error.message))}
        `;
        throw error;
    }
}
