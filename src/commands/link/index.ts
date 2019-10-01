import { LinkContext, LinkConfig } from "./interfaces";
import { linkConfigSchema } from "./configSchema";
import * as fileUtil from "../../util/file";

const getLinkConfig = async (filePath: string): Promise<LinkConfig> => {
    const file = await fileUtil.readJsonFile(filePath);

    const { error, value } = linkConfigSchema.validate(file, { stripUnknown: true, presence: "required" });

    if (error) {
        throw error;
    }

    return value as LinkConfig;
};

export interface LinkOptions {
    configFile: string;
    devMode: boolean;
    workingDirectory: string;
}

export async function link(options: LinkOptions): Promise<void> {
    const { configFile } = options;

    const linkConfig = await getLinkConfig(configFile);
    const fileList = await fileUtil.getAllFilesFromFolder(options.workingDirectory);

    const context: LinkContext = {
        fileList,
        linkConfig
    };

    console.log(context);
}

