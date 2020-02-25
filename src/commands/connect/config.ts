import Joi from "@hapi/joi";
import * as fileUtil from "../../util/file";
import { ComponentConfigFile } from "./interfaces/config";
import { CLIError } from "../../errors";
import logger from "../../util/logger";

const linkConfigSchema = Joi.object({
    type: Joi.string(),
    name: Joi.string().optional(),
    url: Joi.string()
});

const componentConfigSchema = Joi.object({
    path: Joi.string(),
    zeplinNames: Joi.array().items(Joi.string()).min(1),
    name: Joi.string().optional(),
    styleguidist: Joi.object({
        name: Joi.string()
    }).optional()
});

const gitConfigSchema = Joi.object({
    repository: Joi.string(),
    branch: Joi.string().optional(),
    url: Joi.string().optional(),
    path: Joi.string().optional()
});

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
    bitbucket: gitConfigSchema.optional()
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

const getComponentConfigFile = async (filePath: string): Promise<ComponentConfigFile> => {
    const file = await fileUtil.readJsonFile(filePath);

    logger.debug(`${filePath} content: ${JSON.stringify(file)}`);

    const { error, value } = componentConfigFileSchema.validate(file, { allowUnknown: true, presence: "required" });

    if (error) {
        throw new CLIError(`Oops! Looks like ${filePath} has some problems: ${error.message}`);
    }

    return value as ComponentConfigFile;
};

const getComponentConfigFiles = async (
    configFilePaths: string[], globalPlugins: string[] = []
): Promise<ComponentConfigFile[]> => {
    try {
        const configFiles = await Promise.all(
            configFilePaths.map(configFile => getComponentConfigFile(configFile))
        );

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
