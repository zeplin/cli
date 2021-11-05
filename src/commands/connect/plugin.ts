import chalk from "chalk";
import dedent from "ts-dedent";
import importFrom from "import-from";
import path from "path";
import urljoin from "url-join";
import {
    ComponentConfigFile, ConnectPluginInstance, Plugin, GitConfig, BitbucketConfig
} from "./interfaces/config";
import { ConnectedComponentItem, ConnectedBarrelComponents } from "./interfaces/api";
import {
    ComponentConfig, CustomUrlConfig, Link, LinkType
} from "./interfaces/plugin";
import { CLIError } from "../../errors";
import { defaults } from "../../config/defaults";
import logger from "../../util/logger";
import { isRunningFromGlobal } from "../../util/package";
import { getInstallCommand } from "../../util/text";
import { flat } from "../../util/array";
import { isDefined } from "../../util/object";

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
        // Workaround to retrieve plugins for initializer
        const pluginInCwd = importFrom.silent("node_modules", pluginName);
        if (pluginInCwd) {
            return (pluginInCwd as { default: ConnectPluginConstructor }).default;
        }
        return (await import(pluginName)).default as ConnectPluginConstructor;
    } catch (e) {
        const error = new CLIError(dedent`
            Could not find plugin ${chalk.bold(pluginName)} failed.
            Please make sure that it's ${isRunningFromGlobal() ? "globally " : ""}installed and try again.
                ${getInstallCommand(pluginName)}
        `);
        error.stack = e.stack;
        throw error;
    }
};

const createPluginInstance = async (plugin: Plugin, components: ComponentConfig[]): Promise<ConnectPluginInstance> => {
    const PluginClass = await importPlugin(plugin.name);
    const pluginInstance = new PluginClass();

    logger.debug(`Initializing ${plugin.name}.`);

    // Check that plugin implements the required functions
    if (!(typeof pluginInstance.process === "function") ||
        !(typeof pluginInstance.supports === "function")) {
        throw new CLIError(dedent`
                ${chalk.bold(plugin.name)} does not conform Connected Components plugin interface.
                Please make sure that the plugin implements the requirements listed on the documentation.
                https://github.com/zeplin/cli/blob/master/PLUGIN.md
        `);
    }

    pluginInstance.name = plugin.name;

    if (typeof pluginInstance.init === "function") {
        logger.debug(`${plugin.name} has init method. Initializing with ${JSON.stringify(plugin.config)}`);
        await pluginInstance.init({ config: plugin.config, components, logger });
    }

    return pluginInstance;
};

const initializePlugins = async (
    plugins: Plugin[],
    components: ComponentConfig[]
): Promise<ConnectPluginInstance[]> => {
    const imports = plugins.map(plugin => createPluginInstance(plugin, components));

    const pluginInstances = await Promise.all(imports);
    return pluginInstances;
};

const processLink = (link: Link): Link => {
    if (!ALLOWED_LINK_TYPES.includes(link.type)) {
        link.type = LinkType.custom;
    }

    link.url = encodeURI(link.url);
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

interface CodeAndDescription {
    code?: {
        snippet: string;
        lang?: string;
    };
    description?: string;
}

type ComponentConfigToConnectedComponentItemProps = {
    component: ComponentConfig;
    links: Link[];
} & CodeAndDescription;

const componentConfigToConnectedComponentItems = ({
    component,
    links,
    description,
    code
}: ComponentConfigToConnectedComponentItemProps): ConnectedComponentItem[] => [
    ...(component.zeplinNames || []).map(pattern => ({
        pattern,
        name: component.name,
        description,
        filePath: component.path,
        code,
        links
    })),
    ...(component.zeplinIds || []).map(componentId => ({
        componentId,
        name: component.name,
        description,
        filePath: component.path,
        code,
        links
    }))
];

const createLinksFromConfigFile = (
    component: ComponentConfig,
    componentConfigFile: ComponentConfigFile
): Link[] => (componentConfigFile.links || []).map(({ name, type, url }): Link | undefined => {
    // TODO: remove styleguidist specific configuration from CLI core
    if (type === "styleguidist" && component.styleguidist) {
        const encodedKind = encodeURIComponent(component.styleguidist.name);
        return { name, type: LinkType.styleguidist, url: urljoin(url, `#${encodedKind}`) };
    }
    if (component[type]) {
        const customUrlPath = (component[type] as CustomUrlConfig).urlPath;
        if (customUrlPath) {
            return { name, type: LinkType.custom, url: urljoin(url, customUrlPath) };
        }
    }
    return undefined;
}).filter(isDefined);

type ProcessResponse = {
    links: Link[];
} | {
    code?: {
        lang?: string;
        snippet: string;
    };
    description?: string;
    links?: Link[];
}

const processPlugin = async (
    plugin: ConnectPluginInstance,
    component: ComponentConfig
): Promise<ProcessResponse | undefined> => {
    try {
        if (!plugin.supports(component)) {
            logger.debug(`${plugin.name} does not support ${component.path}.`);
            return {};
        }
        logger.debug(`${plugin.name} supports ${component.path}. Processing…`);
        const componentData = await plugin.process(component);
        logger.debug(`${plugin.name} processed ${component.path}: ${componentData}`);

        return {
            code: (
                componentData.snippet
                    ? {
                        snippet: componentData.snippet,
                        lang: componentData.lang
                    }
                    : undefined
            ),
            description: componentData.description,
            links: (componentData.links || []).map(processLink)
        };
    } catch (err) {
        throw new CLIError(dedent`
                Error occurred while processing ${chalk.bold(component.path)} with ${chalk.bold(plugin.name)}:

                ${err.message}
            `, err.stack);
    }
};

const connectComponentConfig = async (
    component: ComponentConfig,
    componentConfigFile: ComponentConfigFile,
    plugins: ConnectPluginInstance[]
): Promise<ConnectedComponentItem[]> => {
    // Execute all plugins
    const pluginResponses = (await Promise.all(plugins.map(plugin => processPlugin(plugin, component))))
        .filter(isDefined);

    const links: Link[] = [
        ...createLinksFromConfigFile(component, componentConfigFile),
        ...createRepoLinks(component.path, componentConfigFile),
        ...pluginResponses.reduce((acc, response) => {
            if (response.links) {
                return [...acc, ...response.links];
            }
            return acc;
        }, [] as Link[])
    ];

    const codeAndDescriptions: CodeAndDescription[] = pluginResponses.reduce((acc, response) => {
        if ("code" in response) {
            return [...acc, { code: response.code, description: response.description }];
        }
        return acc;
    }, [] as CodeAndDescription[]);

    if (codeAndDescriptions.length === 0) {
        codeAndDescriptions.push({});
    }

    return flat(
        codeAndDescriptions.map(codeAndDescription => componentConfigToConnectedComponentItems({
            component,
            links,
            ...codeAndDescription
        }))
    );
};

const connectComponentConfigFile = async (
    componentConfigFile: ComponentConfigFile
): Promise<ConnectedBarrelComponents> => {
    const { components } = componentConfigFile;

    const plugins = await initializePlugins(componentConfigFile.plugins || [], components);

    const items = flat(await Promise.all(
        components.map(component =>
            connectComponentConfig(
                component,
                componentConfigFile,
                plugins
            )
        )
    ));

    return {
        projects: componentConfigFile.projects || [],
        styleguides: componentConfigFile.styleguides || [],
        items
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
