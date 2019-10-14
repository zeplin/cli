import { ComponentConfig } from "link";
import { CLIError } from "../../errors";
import {
    ProcessedComponent, Data, LinkConfig, ProcessedLinkConfig, Url, LinkProcessorModule
} from "./interfaces";
import urljoin from "url-join";

interface LinkProcessorConstructor {
    new(): LinkProcessorModule;
}

// Helper method to initialize plugin classses
const constructLinkProcessor = (Constructor: LinkProcessorConstructor): LinkProcessorModule => new Constructor();

const getProcessors = async (plugins: string[]): Promise<LinkProcessorModule[]> => {
    try {
        const imports = plugins.map(async moduleName => {
            const linkProcessorConstructor = (await import(moduleName)).default as LinkProcessorConstructor;

            const linkProcessorInstance = constructLinkProcessor(linkProcessorConstructor);
            linkProcessorInstance.name = moduleName;
            return linkProcessorInstance;
        });

        const processors = await Promise.all(imports);
        return processors;
    } catch (error) {
        throw new CLIError(error.message);
    }
};

const processComponent = async (
    component: ComponentConfig,
    baseURLs: Url[],
    processors: LinkProcessorModule[]
): Promise<ProcessedComponent> => {
    const data: Data[] = [];
    if (processors.length > 0) {
        // Execute all language processors on the component if supports
        const processorPromises = processors.map(async processor => {
            if (processor.supports(component)) {
                const componentCode = await processor.process(component);

                data.push({
                    processor: processor.name,
                    lang: processor.getLang(),
                    description: componentCode.description,
                    snippet: componentCode.snippet
                });
            }
        });

        await Promise.all(processorPromises);
    }

    const urlPaths: Url[] = [];
    if (component.urlPaths) {
        component.urlPaths.forEach((url, type) => {
            const baseUrl = baseURLs.find(u => u.type === type);
            if (baseUrl) {
                urlPaths.push({ name: baseUrl.name, type, url: urljoin(baseUrl.url, url) });
            }
        });
    }

    return {
        path: component.path,
        name: component.name,
        zeplinNames: component.zeplinNames,
        urlPaths,
        data
    } as ProcessedComponent;
};

const processLinkConfig = async (
    linkConfig: LinkConfig,
    linkProcessors: LinkProcessorModule[]
): Promise<ProcessedLinkConfig> => {
    const components = await Promise.all(
        linkConfig.components.map(component => processComponent(component, linkConfig.baseURLs, linkProcessors))
    );

    return { projects: linkConfig.projects, styleguides: linkConfig.styleguides, components };
};

const processLinkConfigs = (
    linkConfigs: LinkConfig[],
    processorModules: LinkProcessorModule[]
): Promise<ProcessedLinkConfig[]> => {
    const processPromises = linkConfigs.map(linkConfig => processLinkConfig(linkConfig, processorModules));

    return Promise.all(processPromises);
};

export {
    getProcessors,
    processLinkConfigs
};
