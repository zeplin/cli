
import { getComponentConfigFiles } from "./config";
import { importPlugins, linkComponentConfigFiles } from "./plugin";
import { ZeplinApi } from "../../api";
import { LinkedBarrelComponents } from "./interfaces";
import { DevServer } from "./server";
import { AuthenticationService } from "../../service";

const zeplinApi = new ZeplinApi();

const updateLinkedBarrels = async (linkedBarrelComponents: LinkedBarrelComponents[]): Promise<void> => {
    await Promise.all(linkedBarrelComponents.map(async linkedBarrelComponent => {
        // TODO upload progress on console
        if (linkedBarrelComponent.projects) {
            await Promise.all(linkedBarrelComponent.projects.map(async pid => {
                await zeplinApi.uploadLinkedComponents(
                    { barrelId: pid, type: "projects" },
                    { connectedComponents: linkedBarrelComponent.connectedComponents }
                );
            }));
        }

        if (linkedBarrelComponent.styleguides) {
            await Promise.all(linkedBarrelComponent.styleguides.map(async stid => {
                await zeplinApi.uploadLinkedComponents(
                    { barrelId: stid, type: "styleguides" },
                    { connectedComponents: linkedBarrelComponent.connectedComponents }
                );
            }));
        }
    }));

    // TODO debug level logs for troubleshooting
};

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

        // TODO refactor move to apiService
        const authService = new AuthenticationService({ token: process.env.AUTH_TOKEN });

        const authToken = await authService.authenticate();

        zeplinApi.setAuthToken(authToken);

        await updateLinkedBarrels(linkedBarrels);

        console.log("Awesome! All components are successfully connected on Zeplin.");
    }
}
