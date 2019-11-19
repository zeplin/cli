import { ComponentConfig, ComponentData, StorybookConfig } from "connect-plugin";
import { CLIError } from "../../errors";
import {
    ConnectedComponent, Data, ComponentConfigFile, ConnectedBarrelComponents, Link, ConnectPluginModule
} from "./interfaces";
import urljoin from "url-join";
import { defaults } from "../../config/defaults";

interface ConnectPluginConstructor {
    new(): ConnectPluginModule;
}

// Helper method to initialize plugin classses
const constructConnectPlugin = (Constructor: ConnectPluginConstructor): ConnectPluginModule => new Constructor();

const removeEmptyFields = (componentData: ComponentData): ComponentData => {
    if (typeof componentData.description === "undefined" || componentData.description.trim() === "") {
        delete componentData.description;
    }

    if (typeof componentData.snippet === "undefined" || componentData.snippet.trim() === "") {
        delete componentData.snippet;
    }

    return componentData;
};

const prepareStorybookLinks = (baseUrl: string, storybookConfig: StorybookConfig): string[] => {
    const {
        kind,
        stories
    } = storybookConfig;

    const urlEncodedKind = encodeURIComponent(kind);
    if (stories) {
        return stories.map(story =>
            urljoin(baseUrl, `?selectedKind=${urlEncodedKind}&selectedStory=${encodeURIComponent(story)}`)
        );
    }

    return [urljoin(baseUrl, `?selectedKind=${kind}`)];
};

const importPlugins = async (plugins: string[]): Promise<ConnectPluginModule[]> => {
    try {
        const imports = plugins.map(async moduleName => {
            const connectPluginConstructor = (await import(moduleName)).default as ConnectPluginConstructor;

            const connectPluginInstance = constructConnectPlugin(connectPluginConstructor);
            connectPluginInstance.name = moduleName;
            return connectPluginInstance;
        });

        const pluginInstances = await Promise.all(imports);
        return pluginInstances;
    } catch (error) {
        throw new CLIError(error.message);
    }
};

const connectComponentConfig = async (
    component: ComponentConfig,
    componentConfigFile: ComponentConfigFile,
    plugins: ConnectPluginModule[]
): Promise<ConnectedComponent> => {
    const data: Data[] = [];
    if (plugins.length > 0) {
        // Execute all language plugins on the component if supports
        const pluginPromises = plugins.map(async plugin => {
            if (plugin.supports(component)) {
                const componentData = await plugin.process(component);

                data.push({
                    plugin: plugin.name,
                    ...removeEmptyFields(componentData)
                });
            }
        });

        await Promise.all(pluginPromises);
    }

    // TODO move urlPath preparation to service layer
    const urlPaths: Link[] = [];

    if (componentConfigFile.links) {
        componentConfigFile.links.forEach(link => {
            const { name, type, url } = link;
            const foundType = Object.keys(component).some(key => key === link.type);
            if (foundType) {
                const config = component[type];
                if (type === "storybook") {
                    const preparedUrls = prepareStorybookLinks(url, config);
                    preparedUrls.forEach(preparedUrl => {
                        urlPaths.push({ name, type, url: preparedUrl });
                    });
                } else if (type === "styleguidist") {
                    urlPaths.push({ name, type, url: urljoin(url, `#${encodeURIComponent(config.kind)}`) });
                } else {
                    urlPaths.push({ name, type: "custom", url: urljoin(url, config.urlPath) });
                }
            }
        });
    }

    if (componentConfigFile.github) {
        const branch = componentConfigFile.github.branch || defaults.github.branch;
        const url = componentConfigFile.github.url || defaults.github.url;
        const { repository } = componentConfigFile.github;
        urlPaths.push({
            type: "github",
            url: `${url}/${repository}/blob/${branch}/${component.path}`
        });
    }

    return {
        path: component.path,
        name: component.name,
        zeplinNames: component.zeplinNames,
        urlPaths,
        data
    };
};

const connectComponentConfigFile = async (
    componentConfigFile: ComponentConfigFile,
    connectPlugins: ConnectPluginModule[]
): Promise<ConnectedBarrelComponents> => {
    const connectedComponents = await Promise.all(
        componentConfigFile.components.map(component =>
            connectComponentConfig(component, componentConfigFile, connectPlugins)
        )
    );

    return {
        projects: componentConfigFile.projects || [],
        styleguides: componentConfigFile.styleguides || [],
        connectedComponents
    };
};

const connectComponentConfigFiles = (
    componentConfigFiles: ComponentConfigFile[],
    pluginModules: ConnectPluginModule[]
): Promise<ConnectedBarrelComponents[]> => {
    const promises = componentConfigFiles.map(componentConfigFile =>
        connectComponentConfigFile(componentConfigFile, pluginModules)
    );

    return Promise.all(promises);
};

export {
    importPlugins,
    connectComponentConfigFiles
};
