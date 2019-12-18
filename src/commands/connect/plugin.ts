import chalk from "chalk";
import dedent from "dedent";
import urljoin from "url-join";
import { ComponentConfigFile, ConnectPluginInstance, Plugin } from "./interfaces/config";
import { ConnectedComponent, ConnectedBarrelComponents, Data } from "./interfaces/api";
import {
    ComponentData, StorybookComponentConfig, ComponentConfig, CustomUrlConfig, Link, LinkType
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

const prepareStorybookLinks = (baseUrl: string, storybookConfig: StorybookComponentConfig): string[] => {
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

    return [urljoin(baseUrl, `?selectedKind=${urlEncodedKind}`)];
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
    });

    await Promise.all(pluginPromises);

    componentConfigFile.links?.forEach(link => {
        const { name, type, url } = link;
        if (type === "storybook" && component.storybook) {
            const preparedUrls = prepareStorybookLinks(url, component.storybook);
            preparedUrls.forEach(preparedUrl => {
                urlPaths.push({ name, type: LinkType.storybook, url: preparedUrl });
            });
        } else if (type === "styleguidist" && component.styleguidist) {
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
    componentConfigFile: ComponentConfigFile,
    globalPluginInstances: ConnectPluginInstance[]
): Promise<ConnectedBarrelComponents> => {
    const pluginsFromConfigFile = await initializePlugins(componentConfigFile.plugins || []);

    /**
     * Global plugins and plugins from the config file may have the same plugin
     * Filter global plugin instances to avoid duplicate plugin invocation.
     *
     * Favor plugins from config file against plugins from commandline args
     * since config file may have custom plugin configuration.
     */
    const filteredGlobalPlugins = Array.from(globalPluginInstances)
        .filter(g => !pluginsFromConfigFile.some(p => p.name === g.name));

    const connectedComponents = await Promise.all(
        componentConfigFile.components.map(component =>
            connectComponentConfig(
                component,
                componentConfigFile,
                [...filteredGlobalPlugins, ...pluginsFromConfigFile]
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
    componentConfigFiles: ComponentConfigFile[],
    globalPluginInstances: ConnectPluginInstance[]
): Promise<ConnectedBarrelComponents[]> => {
    const promises = componentConfigFiles.map(componentConfigFile =>
        connectComponentConfigFile(componentConfigFile, globalPluginInstances)
    );

    return Promise.all(promises);
};

export {
    initializePlugins,
    connectComponentConfigFiles
};
