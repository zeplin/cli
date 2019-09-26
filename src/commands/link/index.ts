
import { getLinkConfigs } from "./config";
import { getProcessors, processLinkConfigs } from "./processor";

export interface LinkOptions {
    configFiles: string[];
    devMode: boolean;
    workingDirectory: string;
    plugins: string[];
}

export async function link(options: LinkOptions): Promise<void> {
    const { configFiles, plugins } = options;

    const linkConfigs = await getLinkConfigs(configFiles);
    const linkProcessors = await getProcessors(plugins);

    const processedComponentList = await processLinkConfigs(linkConfigs, linkProcessors);

    // TODO: send data to API
    console.log(processedComponentList);
}
