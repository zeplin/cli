import chalk from "chalk";
import path from "path";
import dedent from "ts-dedent";
import urljoin from "url-join";
import {
    ComponentConfigFile, ConnectPluginInstance, Plugin, GitConfig, BitbucketConfig
} from "./interfaces/config";
import { ConnectedComponent, ConnectedBarrelComponents, Data } from "./interfaces/api";
import {
    ComponentData, ComponentConfig, CustomUrlConfig, Link, LinkType
} from "./interfaces/plugin";
import { CLIError } from "../../errors";
import { defaults } from "../../config/defaults";
import logger from "../../util/logger";

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

    logger.debug(`Initializing ${plugin.name}.`);

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
        logger.debug(`${plugin.name} has init method. Initializing with ${plugin.config}`);
        await pluginInstance.init({ config: plugin.config });
    }

    return pluginInstance;
};

const initializePlugins = async (plugins: Plugin[]): Promise<ConnectPluginInstance[]> => {
    const imports = plugins.map(plugin => createPluginInstance(plugin));

    const pluginInstances = await Promise.all(imports);
    return pluginInstances;
};

const convertToData = (plugin: string, componentData: ComponentData): Data => {
    const copyComponentData = { ...componentData };

    if (typeof copyComponentData.description === "undefined" || copyComponentData.description.trim() === "") {
        delete copyComponentData.description;
    }

    if (typeof copyComponentData.snippet === "undefined" || copyComponentData.snippet.trim() === "") {
        delete copyComponentData.snippet;
        delete copyComponentData.lang;
    }

    delete copyComponentData.links;

    return {
        plugin,
        ...copyComponentData
    };
};

const processLink = (link: Link): Link => {
    if (!ALLOWED_LINK_TYPES.includes(link.type)) {
        link.type = LinkType.custom;
    }
    return link;
};

const createRepoLink = (
    componentPath: string,
    gitConfig: GitConfig,
    repoDefaults: { url: string; branch: string; prefix?: string; type: LinkType }
): Link => {
    const url = gitConfig.url || repoDefaults.url;
    const { repository } = gitConfig;
    const branch = gitConfig.branch || repoDefaults.branch;
    const basePath = gitConfig.path || "";
    const prefix = repoDefaults.prefix || "";
    const filePath = componentPath.split(path.sep);

    return {
        type: repoDefaults.type,
        url: encodeURI(
            urljoin(url, repository, prefix, branch, basePath, ...filePath)
        )
    };
};

const createBitbucketLink = (
    componentPath: string,
    bitbucketConfig: BitbucketConfig
): Link => {
    const {
        url = defaults.bitbucket.url,
        repository,
        branch = "",
        project = "",
        user = "",
        path: basePath = ""
    } = bitbucketConfig;

    const isCloud = url === defaults.bitbucket.url;

    const filePath = componentPath.split(path.sep);

    let preparedUrl;

    if (isCloud) {
        const prefix = defaults.bitbucket.cloudPrefix;
        preparedUrl = urljoin(url, user, repository, prefix, branch, basePath, ...filePath);
    } else if (!project && !user) {
        // Backward compatibility
        // TODO: remove this block after a while
        preparedUrl = urljoin(url, repository, branch, basePath, ...filePath);
    } else {
        const owner = project
            ? { path: "projects", name: project }
            : { path: "users", name: user };

        preparedUrl = urljoin(url, owner.path, owner.name, "repos", repository, "browse", basePath, ...filePath);
        if (branch) {
            preparedUrl += `?at=${branch}`;
        }
    }
    return {
        type: defaults.bitbucket.type,
        url: encodeURI(preparedUrl)
    };
};

const createRepoLinks = (componentPath: string, componentConfigFile: ComponentConfigFile): Link[] => {
    const repoLinks: Link[] = [];

    if (componentConfigFile.github) {
        repoLinks.push(createRepoLink(componentPath, componentConfigFile.github, defaults.github));
    }

    if (componentConfigFile.gitlab) {
        repoLinks.push(createRepoLink(componentPath, componentConfigFile.gitlab, defaults.gitlab));
    }

    if (componentConfigFile.bitbucket) {
        repoLinks.push(createBitbucketLink(componentPath, componentConfigFile.bitbucket));
    }

    return repoLinks;
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
                logger.debug(`${plugin.name} supports ${component.path}. Processing…`);
                const componentData = await plugin.process(component);

                data.push(convertToData(plugin.name, componentData));

                componentData.links?.forEach(link =>
                    urlPaths.push(processLink(link))
                );

                logger.debug(`${plugin.name} processed ${component.path}: ${componentData}`);
            } else {
                logger.debug(`${plugin.name} does not support ${component.path}.`);
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
            const encodedKind = encodeURIComponent(component.styleguidist.name);
            urlPaths.push({ name, type: LinkType.styleguidist, url: urljoin(url, `#${encodedKind}`) });
        } else if (component[type]) {
            const customUrlPath = (component[type] as CustomUrlConfig).urlPath;
            if (customUrlPath) {
                urlPaths.push({ name, type: LinkType.custom, url: urljoin(url, customUrlPath) });
            }
        }
    });

    urlPaths.push(...createRepoLinks(component.path, componentConfigFile));

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
