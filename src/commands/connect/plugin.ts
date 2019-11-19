import { ComponentConfig, ComponentData } from "connect-plugin";
import { CLIError } from "../../errors";
import {
    ConnectedComponent, Data, ComponentConfigFile, ConnectedBarrelComponents, Url, ConnectPluginModule
} from "./interfaces";
import urljoin from "url-join";

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
    links: Url[],
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

    const urlPaths: Url[] = [];
    if (component.urlPaths) {
        const configUrlPaths = component.urlPaths;
        Object.keys(configUrlPaths).forEach(type => {
            const link = links.find(u => u.type === type);
            const url = configUrlPaths[type];
            if (link) {
                urlPaths.push({ name: link.name, type, url: urljoin(link.url, url) });
            }
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
            connectComponentConfig(component, componentConfigFile.links, connectPlugins)
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
