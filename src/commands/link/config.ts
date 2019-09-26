import Joi from "@hapi/joi";
import * as fileUtil from "../../util/file";
import { LinkConfig } from "./interfaces";
import { CLIError } from "../../errors";

const urlConfigSchema = Joi.object({
    name: Joi.string(),
    type: Joi.string(),
    url: Joi.string()
});

const componentConfigSchema = Joi.object({
    path: Joi.string(),
    zeplinNames: Joi.array().items(Joi.string()),
    name: Joi.string().optional(),
    urlPaths: Joi.object().pattern(Joi.string(), Joi.string()).optional()
});

const linkConfigSchema = Joi.object({
    barrels: Joi.array().items(Joi.string()),
    baseUrls: Joi.array().items(urlConfigSchema),
    components: Joi.array().items(componentConfigSchema)
});

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
        const linkConfigs: LinkConfig[] = [];
        const promises: Promise<LinkConfig>[] = [];

        configFiles.forEach(configFile => {
            const linkConfigPromise = getLinkConfig(configFile);
            promises.push(linkConfigPromise);
        });

        (await Promise.all(promises)).forEach(linkConfig => {
            linkConfigs.push(linkConfig);
        });

        return linkConfigs;
    } catch (error) {
        throw new CLIError(error.message);
    }
};

export {
    getLinkConfig,
    getLinkConfigs
};
