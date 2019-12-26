import chalk from "chalk";
import dedent from "ts-dedent";
import urljoin from "url-join";
import { ComponentConfigFile, ConnectPluginInstance, Plugin } from "./interfaces/config";
import { ConnectedComponent, ConnectedBarrelComponents, Data } from "./interfaces/api";
import {
    ComponentData, ComponentConfig, CustomUrlConfig, Link, LinkType
} from "./interfaces/plugin";
import { CLIError } from "../../errors";
import { defaults } from "../../config/defaults";

const ALLOWED_LINK_TYPES = [
    LinkType.styleguidist,
    LinkType.storybook,
    LinkType.github,
    LinkType.custom
];

interface ConnectPluginConstructor {
    new(): ConnectPluginInstance;
}

const importPlugin = async (pluginName: string): Promise<ConnectPluginConstructor> => {
    try {
        return (await import(pluginName)).default as ConnectPluginConstructor;
    } catch (e) {
        const error = new CLIError(dedent`
            Could not find plugin ${chalk.bold(pluginName)} failed.
            Please make sure that it's globally installed and try again.
                npm install -g ${pluginName}
        `);
        error.stack = e.stack;
        throw error;
    }
};

const createPluginInstance = async (plugin: Plugin): Promise<ConnectPluginInstance> => {
    const PluginClass = await importPlugin(plugin.name);
    const pluginInstance = new PluginClass();

    // Check that plugin implements the required functions
    if (!(typeof pluginInstance.process === "function") ||
        !(typeof pluginInstance.supports === "function")) {
        throw new CLIError(dedent`
                ${chalk.bold(plugin.name)} does not conform Connected Components plugin interface.
                Please make sure that the plugin implements the requirements listed on the documentation.
                https://github.com/zeplin/cli/blob/develop/PLUGIN.md
        `);
    }

    pluginInstance.name = plugin.name;

    if (typeof pluginInstance.init === "function") {
        pluginInstance.init({ config: plugin.config });
    }

    return pluginInstance;
};

const initializePlugins = async (plugins: Plugin[]): Promise<ConnectPluginInstance[]> => {
    const imports = plugins.map(plugin => createPluginInstance(plugin));

    const pluginInstances = await Promise.all(imports);
    return pluginInstances;
};

const removeEmptyFields = (componentData: ComponentData): ComponentData => {
    if (typeof componentData.description === "undefined" || componentData.description.trim() === "") {
        delete componentData.description;
    }

    if (typeof componentData.snippet === "undefined" || componentData.snippet.trim() === "") {
        delete componentData.snippet;
        delete componentData.lang;
    }

    return componentData;
};

const processLink = (link: Link): Link => {
    if (!ALLOWED_LINK_TYPES.includes(link.type)) {
        link.type = LinkType.custom;
    }
    return link;
};

const connectComponentConfig = async (
    component: ComponentConfig,
    componentConfigFile: ComponentConfigFile,
    plugins: ConnectPluginInstance[]
): Promise<ConnectedComponent> => {
    const data: Data[] = [];
    const urlPaths: Link[] = [];

    // Execute all plugins
    const pluginPromises = plugins.map(async plugin => {
        try {
            if (plugin.supports(component)) {
                const componentData = await plugin.process(component);

                data.push({
                    plugin: plugin.name,
                    ...removeEmptyFields(componentData)
                });

                componentData.links?.forEach(link =>
                    urlPaths.push(processLink(link))
                );
            }
        } catch (err) {
            throw new CLIError(dedent`
                Error occurred while processing ${chalk.bold(component.path)} with ${chalk.bold(plugin.name)}:

                ${err.message}
            `, err.stack);
        }
    });

    await Promise.all(pluginPromises);

    componentConfigFile.links?.forEach(link => {
        const { name, type, url } = link;

        // TODO: remove styleguidist specific configuration from CLI core
        if (type === "styleguidist" && component.styleguidist) {
            const encodedKind = encodeURIComponent(component.styleguidist.kind);
            urlPaths.push({ name, type: LinkType.styleguidist, url: urljoin(url, `#${encodedKind}`) });
        } else if (component[type]) {
            const customUrlPath = (component[type] as CustomUrlConfig).urlPath;
            if (customUrlPath) {
                urlPaths.push({ name, type: LinkType.custom, url: urljoin(url, customUrlPath) });
            }
        }
    });

    if (componentConfigFile.github) {
        const url = componentConfigFile.github.url || defaults.github.url;
        const { repository } = componentConfigFile.github;
        const branch = componentConfigFile.github.branch || defaults.github.branch;
        const path = encodeURIComponent(componentConfigFile.github.path || "");
        const componentPath = encodeURIComponent(component.path);

        urlPaths.push({
            type: LinkType.github,
            url: urljoin(url, repository, "/blob/", branch, path, componentPath)
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
    componentConfigFile: ComponentConfigFile
): Promise<ConnectedBarrelComponents> => {
    const plugins = await initializePlugins(componentConfigFile.plugins || []);

    const connectedComponents = await Promise.all(
        componentConfigFile.components.map(component =>
            connectComponentConfig(
                component,
                componentConfigFile,
                plugins
            )
        )
    );

    return {
        projects: componentConfigFile.projects || [],
        styleguides: componentConfigFile.styleguides || [],
        connectedComponents
    };
};

const connectComponentConfigFiles = (
    componentConfigFiles: ComponentConfigFile[]
): Promise<ConnectedBarrelComponents[]> => {
    const promises = componentConfigFiles.map(componentConfigFile =>
        connectComponentConfigFile(componentConfigFile)
    );

    return Promise.all(promises);
};

export {
    connectComponentConfigFiles
};
