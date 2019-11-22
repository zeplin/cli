import { ComponentConfig, ComponentData, StorybookConfig } from "connect-plugin";
import { CLIError } from "../../errors";
import {
    ConnectedComponent, Data, ComponentConfigFile, ConnectedBarrelComponents, Link, ConnectPluginModule
} from "./interfaces";
import urljoin from "url-join";
import { defaults } from "../../config/defaults";
import dedent from "dedent";
import chalk from "chalk";

interface ConnectPluginConstructor {
    new(): ConnectPluginModule;
}

// Helper method to initialize plugin classses
const createInstance = (pluginName: string, Plugin: ConnectPluginConstructor): ConnectPluginModule => {
    try {
        const plugin = new Plugin();

        // Check that plugin implements the required methods
        if (!plugin.process || !plugin.supports) {
            throw new Error();
        }

        plugin.name = pluginName;
        return plugin;
    } catch (e) {
        const error = new CLIError(dedent`
            ${chalk.bold(pluginName)} does not conform Connected Components plugin interface.
            Please make sure that the plugin implements the requirements listed on the documentation.
            https://github.com/zeplin/cli/blob/develop/PLUGIN.md
        `); // TODO add documentation link
        error.stack = e.stack;
        throw error;
    }
};

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

    return [urljoin(baseUrl, `?selectedKind=${urlEncodedKind}`)];
};

const importPlugin = async (pluginName: string): Promise<ConnectPluginConstructor> => {
    try {
        return (await import(pluginName)).default as ConnectPluginConstructor;
    } catch (e) {
        const error = new CLIError(dedent`
            Finding plugin module ${chalk.bold(pluginName)} failed.
            Please make sure that it's installed and try again.
        `);
        error.stack = e.stack;
        throw error;
    }
};

const importPlugins = async (plugins: string[]): Promise<ConnectPluginModule[]> => {
    try {
        const imports = plugins.map(async pluginName => {
            const pluginConstructor = await importPlugin(pluginName);
            return createInstance(pluginName, pluginConstructor);
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
            if (type === "storybook" && component.storybook) {
                const preparedUrls = prepareStorybookLinks(url, component.storybook);
                preparedUrls.forEach(preparedUrl => {
                    urlPaths.push({ name, type, url: preparedUrl });
                });
            } else if (type === "styleguidist" && component.styleguidist) {
                const encodedKind = encodeURIComponent(component.styleguidist.kind);
                urlPaths.push({ name, type, url: urljoin(url, `#${encodedKind}`) });
            } else if (component[type]) {
                urlPaths.push({ name, type: "custom", url: urljoin(url, component[type].urlPath) });
            }
        });
    }

    if (componentConfigFile.github) {
        const url = componentConfigFile.github.url || defaults.github.url;
        const { repository } = componentConfigFile.github;
        const branch = componentConfigFile.github.branch || defaults.github.branch;
        const path = encodeURIComponent(componentConfigFile.github.path || "");
        const componentPath = encodeURIComponent(component.path);

        urlPaths.push({
            type: "github",
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
