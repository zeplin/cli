import { LinkOptions, LinkContext, LinkConfig } from "./interfaces";
import { linkConfigSchema } from "./configSchema";
import * as fileUtil from "../../util/file";

const getLinkConfig = (filePath: string): LinkConfig => {
    const file = fileUtil.readJsonFile(filePath);

    const { error, value } = linkConfigSchema.validate(file, { stripUnknown: true });

    if (error) {
        throw error;
    }

    return value as LinkConfig;
};

const link = (options: LinkOptions): void => {
    const { configFile } = options;

    const linkConfig = getLinkConfig(configFile);
    const fileList = fileUtil.getAllFilesFromFolder(options.workingDirectory);

    const context: LinkContext = {
        fileList,
        linkConfig
    };

    console.log(context);
};

export { link };