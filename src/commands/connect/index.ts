
import { getComponentConfigFiles } from "./config";
import { importPlugins, connectComponentConfigFiles } from "./plugin";
import { ConnectDevServer } from "./server";
import { ConnectedComponentsService } from "./service";

export interface ConnectOptions {
    configFiles: string[];
    devMode: boolean;
    devModePort: number;
    plugins: string[];
}

export async function connect(options: ConnectOptions): Promise<void> {
    const {
        configFiles,
        plugins,
        devMode,
        devModePort
    } = options;

    const componentConfigFiles = await getComponentConfigFiles(configFiles);

    const pluginInstances = await importPlugins(plugins);

    const connectedBarrels = await connectComponentConfigFiles(componentConfigFiles, pluginInstances);

    if (devMode) {
        console.log("Starting development server…");

        const devServer = new ConnectDevServer(connectedBarrels);

        await devServer.start(devModePort);

        console.log(`Development server is started on port ${devModePort}!`);
    } else {
        console.log("Uploading all connected components into Zeplin…");

        const service = new ConnectedComponentsService();

        await service.uploadConnectedBarrels(connectedBarrels);

        console.log("Awesome! All components are successfully connected on Zeplin.");
    }
}
