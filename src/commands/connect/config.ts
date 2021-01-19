import { cosmiconfig } from "cosmiconfig";
import strip from "strip-comments";
import Joi from "@hapi/joi";
import chalk from "chalk";
import dedent from "ts-dedent";
import path from "path";
import { ComponentConfigFile } from "./interfaces/config";
import { CLIError } from "../../errors";
import logger from "../../util/logger";
import { getAsRelativePath } from "../../util/file";

const linkConfigSchema = Joi.object({
    type: Joi.string(),
    name: Joi.string().optional(),
    url: Joi.string()
});

const componentConfigSchema = Joi.object({
    path: Joi.string(),
    zeplinNames: Joi.array().items(Joi.string()).optional(),
    zeplinIds: Joi.array().items(Joi.string()).optional(),
    name: Joi.string().optional(),
    styleguidist: Joi.object({
        name: Joi.string()
    }).optional()
}).or("zeplinNames", "zeplinIds");

const gitConfigSchema = Joi.object({
    repository: Joi.string(),
    branch: Joi.string().optional(),
    url: Joi.string().optional(),
    path: Joi.string().optional()
});

const bitbucketConfigSchema = Joi.object({
    repository: Joi.string(),
    branch: Joi.string().optional(),
    url: Joi.string().optional(),
    path: Joi.string().optional(),
    project: Joi.string().optional(),
    user: Joi.string().optional()
}).xor("project", "user");

const pluginSchema = Joi.object({
    name: Joi.string(),
    config: Joi.object().unknown().optional()
});

const componentConfigFileSchema = Joi.object({
    projects: Joi.array().items(Joi.string()).optional(),
    styleguides: Joi.array().items(Joi.string()).optional(),
    plugins: Joi.array().items(pluginSchema).optional(),
    links: Joi.array().items(linkConfigSchema).optional(),
    components: Joi.array().items(componentConfigSchema).min(1),
    github: gitConfigSchema.optional(),
    gitlab: gitConfigSchema.optional(),
    bitbucket: bitbucketConfigSchema.optional()
}).custom((value, helpers) => {
    if (value.projects && value.styleguides) {
        if (value.projects.length === 0 && value.styleguides.length === 0) {
            throw new Error("at least one of `projects` or `styleguides` properties must contain 1 item.");
        }
    } else if (value.projects) {
        if (value.projects.length === 0) {
            throw new Error("`projects` must contain at least 1 item.");
        }
    } else if (value.styleguides) {
        if (value.styleguides.length === 0) {
            throw new Error("`styleguides` must contain at least 1 item.");
        }
    } else {
        return helpers.error("object.missing", { peersWithLabels: ["projects", "styleguides"] });
    }
    return value;
});

const validateConfigSchema = (config: unknown, params: { filePath: string }): ComponentConfigFile => {
    const { error, value } = componentConfigFileSchema.validate(config, { allowUnknown: true, presence: "required" });

    const relativeFilePath = getAsRelativePath(params.filePath);

    if (error) {
        throw new CLIError(`Oops! Looks like ${relativeFilePath} has some problems: ${error.message}`);
    }

    return value as ComponentConfigFile;
};

const configExplorerOptions = {
    searchPlaces: [
        "components.json",
        "components.yaml",
        "components.config.js"
    ],
    stopDir: process.cwd(),
    loaders: {
        ".json": (_filePath: string, content: string): object | null => {
            const stripped = strip(content);

            return JSON.parse(stripped);
        }
    }
};

const configExplorer = cosmiconfig("@zeplin/cli", configExplorerOptions);

const getComponentConfigFile = async (filePath: string): Promise<ComponentConfigFile> => {
    let result;

    const relativeFilePath = getAsRelativePath(filePath);

    try {
        result = await configExplorer.load(filePath);
    } catch (err) {
        throw new CLIError(`Cannot access ${relativeFilePath}: ${err.message}`);
    }

    if (!result || result.isEmpty) {
        throw new CLIError(`Oops! Looks like ${relativeFilePath} is empty.`);
    }

    const { config } = result;

    return validateConfigSchema(config, { filePath });
};

const discoverDefaultConfigFile = async (configRootDir: string): Promise<ComponentConfigFile | null> => {
    let discoveredConfigFile;

    try {
        const searchFrom = path.join(configRootDir, ".zeplin");

        discoveredConfigFile = await configExplorer.search(searchFrom);
    } catch (err) {
        logger.debug(`Failed configuration file discovery: ${err.message}`);
    }

    if (!discoveredConfigFile) {
        logger.debug("Could not find a configuration file during discovery");

        return null;
    }

    const { config, filepath } = discoveredConfigFile;

    return validateConfigSchema(config, { filePath: filepath });
};

const getComponentConfigFiles = async (
    configFilePaths: string[], globalPlugins: string[] = [], configRootDir = process.cwd()
): Promise<ComponentConfigFile[]> => {
    try {
        let configFiles: ComponentConfigFile[];

        /**
         * If config file path array is not empty, use only the specified config files.
         *
         * If no config file was specified by the user, try to discover default configurtation
         * file.
         */
        if (configFilePaths.length > 0) {
            configFiles = await Promise.all(
                configFilePaths.map(configFile => getComponentConfigFile(configFile))
            );
        } else {
            const defaultConfigFile = await discoverDefaultConfigFile(configRootDir);

            if (!defaultConfigFile) {
                throw new Error(dedent`
                    Missing configuration file!
                    Please refer to ${chalk.underline`https://zpl.io/connected-components`} to create a configuration file.
                `);
            }

            configFiles = [defaultConfigFile];
        }

        /**
         * Global plugins and plugins from the config files may contain the same plugin
         * Filter global plugin instances to avoid duplicate plugin invocation.
         *
         * Favor plugins from config file against plugins from commandline args
         * since config file may have custom plugin configuration.
         */
        return configFiles.map(configFile => {
            const plugins = configFile.plugins || [];

            const pluginNamesFromConfigFile = plugins.map(p => p.name);

            globalPlugins.forEach(globalPlugin => {
                if (pluginNamesFromConfigFile.includes(globalPlugin)) {
                    logger.debug(`${globalPlugin} is defined using both config file and -p option.`);
                } else {
                    plugins.push({ name: globalPlugin });
                }
            });

            configFile.plugins = plugins;
            return configFile;
        });
    } catch (error) {
        throw new CLIError(error.message);
    }
};

export {
    getComponentConfigFiles
};
