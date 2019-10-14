
import { getLinkConfigs } from "./config";
import { getProcessors, processLinkConfigs } from "./processor";
import { ZeplinApi } from "../../api";
import { ProcessedLinkConfig } from "./interfaces";

const zeplinApi = new ZeplinApi();

const updateProcessedComponents = async (processedLinkConfigList: ProcessedLinkConfig[]): Promise<void> => {
    await Promise.all(processedLinkConfigList.map(async processedLinkConfig => {
        // TODO upload progress on console
        if (processedLinkConfig.projects) {
            await Promise.all(processedLinkConfig.projects.map(async pid => {
                await zeplinApi.uploadProcessedComponents({ barrelId: pid, type: "projects" }, { components: processedLinkConfig.components });
            }));
        }

        if (processedLinkConfig.styleguides) {
            await Promise.all(processedLinkConfig.styleguides.map(async stid => {
                await zeplinApi.uploadProcessedComponents({ barrelId: stid, type: "styleguides" }, { components: processedLinkConfig.components });
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

    const linkConfigs = await getLinkConfigs(configFiles);
    const linkProcessors = await getProcessors(plugins);

    const processedComponentList = await processLinkConfigs(linkConfigs, linkProcessors);

    if (devMode) {
        console.log("Starting development server...");
        // TODO Development server
    } else {
        await updateProcessedComponents(processedComponentList);
        console.log("Awesome! All components are successfully linked with Zeplin.");
    }
}
