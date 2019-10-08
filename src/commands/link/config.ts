import Joi from "@hapi/joi";
import * as fileUtil from "../../util/file";
import { LinkConfig } from "./interfaces";
import { CLIError } from "../../errors";

const urlConfigSchema = Joi.object({
    type: Joi.string(),
    name: Joi.string().optional(),
    url: Joi.string()
});

const componentConfigSchema = Joi.object({
    path: Joi.string(),
    zeplinNames: Joi.array().items(Joi.string()),
    name: Joi.string().optional(),
    urlPaths: Joi.object().pattern(Joi.string(), Joi.string()).optional()
});

const linkConfigSchema = Joi.object({
    projects: Joi.array().items(Joi.string()).min(1).optional(),
    styleguides: Joi.array().items(Joi.string()).min(1).optional(),
    baseURLs: Joi.array().items(urlConfigSchema),
    components: Joi.array().items(componentConfigSchema)
}).or("projects", "styleguides");

const getLinkConfig = async (filePath: string): Promise<LinkConfig> => {
    const file = await fileUtil.readJsonFile(filePath);

    const { error, value } = linkConfigSchema.validate(file, { stripUnknown: true, presence: "required" });

    if (error) {
        throw error;
    }

    return value as LinkConfig;
};

const getLinkConfigs = async (configFiles: string[]): Promise<LinkConfig[]> => {
    try {
        const promises = configFiles.map(configFile => getLinkConfig(configFile));

        const linkConfigs = await Promise.all(promises);

        return linkConfigs;
    } catch (error) {
        throw new CLIError(error.message);
    }
};

export {
    getLinkConfig,
    getLinkConfigs
};
