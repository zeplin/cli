
import { getComponentConfigFiles } from "./config";
import { importPlugins, linkComponentConfigFiles } from "./plugin";
import { ZeplinApi } from "../../api";
import { LinkedBarrelComponents } from "./interfaces";

const zeplinApi = new ZeplinApi();

const updateLinkedBarrelComponents = async (linkedBarrelComponents: LinkedBarrelComponents[]): Promise<void> => {
    await Promise.all(linkedBarrelComponents.map(async linkedBarrelComponent => {
        // TODO upload progress on console
        if (linkedBarrelComponent.projects) {
            await Promise.all(linkedBarrelComponent.projects.map(async pid => {
                await zeplinApi.uploadLinkedComponents(
                    { barrelId: pid, type: "projects" },
                    { linkedComponents: linkedBarrelComponent.linkedComponents }
                );
            }));
        }

        if (linkedBarrelComponent.styleguides) {
            await Promise.all(linkedBarrelComponent.styleguides.map(async stid => {
                await zeplinApi.uploadLinkedComponents(
                    { barrelId: stid, type: "styleguides" },
                    { linkedComponents: linkedBarrelComponent.linkedComponents }
                );
            }));
        }
    }));

    // TODO debug level logs for troubleshooting
};

export interface LinkOptions {
    configFiles: string[];
    devMode: boolean;
    plugins: string[];
    authToken: string;
}

export async function link(options: LinkOptions): Promise<void> {
    const { configFiles, plugins, devMode } = options;

    const componentConfigFiles = await getComponentConfigFiles(configFiles);
    const pluginInstances = await importPlugins(plugins);

    const linkedBarrelComponents = await linkComponentConfigFiles(componentConfigFiles, pluginInstances);

    if (devMode) {
        console.log("Starting development server...");
        // TODO Development server
    } else {
        await updateLinkedBarrelComponents(linkedBarrelComponents);
        console.log("Awesome! All components are successfully linked with Zeplin.");
    }
}
