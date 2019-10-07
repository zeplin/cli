
import { getLinkConfigs } from "./config";
import { getProcessors, processLinkConfigs } from "./processor";
import { ZeplinApi } from "../../api";
import { ProcessedLinkConfig } from "./interfaces";

const zeplinApi = new ZeplinApi();

const updateProcessedComponents = async (processedLinkConfigList: ProcessedLinkConfig[]): Promise<void> => {
    if (processedLinkConfigList) {
        await Promise.all(processedLinkConfigList.map(async processedLinkConfig => {
            await Promise.all(processedLinkConfig.barrels.map(async barrelId => {
                await zeplinApi.updateProcessedComponents(barrelId, { components: processedLinkConfig.components });
            }));
        }));
    }
};

export interface LinkOptions {
    configFiles: string[];
    devMode: boolean;
    workingDirectory: string;
    plugins: string[];
    authToken: string;
}

export async function link(options: LinkOptions): Promise<void> {
    const { configFiles, plugins } = options;

    const linkConfigs = await getLinkConfigs(configFiles);
    const linkProcessors = await getProcessors(plugins);

    const processedComponentList = await processLinkConfigs(linkConfigs, linkProcessors);

    updateProcessedComponents(processedComponentList);
}
