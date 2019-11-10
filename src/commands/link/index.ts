
import { getComponentConfigFiles } from "./config";
import { importPlugins, linkComponentConfigFiles } from "./plugin";
import { DevServer } from "./server";
import { ConnectedComponentsService } from "./service";

export interface LinkOptions {
    configFiles: string[];
    devMode: boolean;
    devModePort: number;
    plugins: string[];
}

export async function link(options: LinkOptions): Promise<void> {
    const {
        configFiles,
        plugins,
        devMode,
        devModePort
    } = options;

    const componentConfigFiles = await getComponentConfigFiles(configFiles);

    const pluginInstances = await importPlugins(plugins);

    const linkedBarrels = await linkComponentConfigFiles(componentConfigFiles, pluginInstances);

    if (devMode) {
        console.log("Starting development server...");

        const devServer = new DevServer(linkedBarrels);

        await devServer.start(devModePort);

        console.log(`Development server is started on port ${devModePort}!`);
    } else {
        console.log("Uploading all connected components into Zeplin...");

        const service = new ConnectedComponentsService();

        await service.uploadLinkedBarrels(linkedBarrels);

        // Await updateLinkedBarrels(linkedBarrels);

        console.log("Awesome! All components are successfully connected on Zeplin.");
    }
}
