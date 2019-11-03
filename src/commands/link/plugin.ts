import { ComponentConfig } from "link";
import { CLIError } from "../../errors";
import {
    LinkedComponent, Data, ComponentConfigFile, LinkedBarrelComponents, Url, ZeplinLinkPluginModule
} from "./interfaces";
import urljoin from "url-join";

interface ZeplinLinkPluginConstructor {
    new(): ZeplinLinkPluginModule;
}

// Helper method to initialize plugin classses
const constructLinkPlugin = (Constructor: ZeplinLinkPluginConstructor): ZeplinLinkPluginModule => new Constructor();

const importPlugins = async (plugins: string[]): Promise<ZeplinLinkPluginModule[]> => {
    try {
        const imports = plugins.map(async moduleName => {
            const linkPluginConstructor = (await import(moduleName)).default as ZeplinLinkPluginConstructor;

            const linkPluginInstance = constructLinkPlugin(linkPluginConstructor);
            linkPluginInstance.name = moduleName;
            return linkPluginInstance;
        });

        const pluginInstances = await Promise.all(imports);
        return pluginInstances;
    } catch (error) {
        throw new CLIError(error.message);
    }
};

const linkComponentConfig = async (
    component: ComponentConfig,
    baseURLs: Url[],
    plugins: ZeplinLinkPluginModule[]
): Promise<LinkedComponent> => {
    const data: Data[] = [];
    if (plugins.length > 0) {
        // Execute all language plugins on the component if supports
        const pluginPromises = plugins.map(async plugin => {
            if (plugin.supports(component)) {
                let componentData = await plugin.process(component);

                // Remove undefined keys
                componentData = JSON.parse(JSON.stringify(componentData));

                data.push({
                    plugin: plugin.name,
                    ...componentData
                });
            }
        });

        await Promise.all(pluginPromises);
    }

    const urlPaths: Url[] = [];
    if (component.urlPaths) {
        const configUrlPaths = component.urlPaths;
        Object.keys(configUrlPaths).forEach(type => {
            const baseUrl = baseURLs.find(u => u.type === type);
            const url = configUrlPaths[type];
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
    } as LinkedComponent;
};

const linkComponentConfigFile = async (
    componentConfigFile: ComponentConfigFile,
    linkPlugins: ZeplinLinkPluginModule[]
): Promise<LinkedBarrelComponents> => {
    const linkedComponents = await Promise.all(
        componentConfigFile.components.map(component =>
            linkComponentConfig(component, componentConfigFile.baseURLs, linkPlugins)
        )
    );

    return {
        projects: componentConfigFile.projects || [],
        styleguides: componentConfigFile.styleguides || [],
        linkedComponents
    };
};

const linkComponentConfigFiles = (
    componentConfigFiles: ComponentConfigFile[],
    pluginModules: ZeplinLinkPluginModule[]
): Promise<LinkedBarrelComponents[]> => {
    const promises = componentConfigFiles.map(componentConfigFile =>
        linkComponentConfigFile(componentConfigFile, pluginModules)
    );

    return Promise.all(promises);
};

export {
    importPlugins,
    linkComponentConfigFiles
};
