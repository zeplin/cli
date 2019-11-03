import Joi from "@hapi/joi";
import * as fileUtil from "../../util/file";
import { ComponentConfigFile } from "./interfaces";
import { CLIError } from "../../errors";

const urlConfigSchema = Joi.object({
    type: Joi.string(),
    name: Joi.string().optional(),
    url: Joi.string()
});

const componentConfigSchema = Joi.object({
    path: Joi.string(),
    zeplinNames: Joi.array().items(Joi.string()).min(1),
    name: Joi.string().optional(),
    urlPaths: Joi.object().pattern(Joi.string(), Joi.string()).optional()
});

const componentConfigFileSchema = Joi.object({
    projects: Joi.array().items(Joi.string()).min(1).optional(),
    styleguides: Joi.array().items(Joi.string()).min(1).optional(),
    baseURLs: Joi.array().items(urlConfigSchema),
    components: Joi.array().items(componentConfigSchema).min(1)
}).or("projects", "styleguides");

const getComponentConfigFile = async (filePath: string): Promise<ComponentConfigFile> => {
    const file = await fileUtil.readJsonFile(filePath);

    const { error, value } = componentConfigFileSchema.validate(file, { stripUnknown: true, presence: "required" });

    if (error) {
        throw new CLIError(`Oops! Looks like ${filePath} has some problems: ${error.message}`);
    }

    return value as ComponentConfigFile;
};

const getComponentConfigFiles = async (configFilePaths: string[]): Promise<ComponentConfigFile[]> => {
    try {
        const promises = configFilePaths.map(configFile => getComponentConfigFile(configFile));

        const configFiles = await Promise.all(promises);

        return configFiles;
    } catch (error) {
        throw new CLIError(error.message);
    }
};

export {
    getComponentConfigFile,
    getComponentConfigFiles
};
