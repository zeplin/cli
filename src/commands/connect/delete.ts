import chalk from "chalk";
import dedent from "ts-dedent";
import { ConnectOptions } from ".";
import logger from "../../util/logger";
import { indent } from "../../util/text";
import { getComponentConfigFiles } from "./config";
import { ConnectedBarrels } from "./interfaces/api";
import { ConnectedComponentsService } from "./service";

const service = new ConnectedComponentsService();

const deleteConnectedBarrels = async (connectedBarrels: ConnectedBarrels[]): Promise<void> => {
    logger.info("Deleting Connected Components from Zeplin…");

    await service.deleteConnectedBarrels(connectedBarrels);

    logger.info("🔥 Component connections successfully deleted from components in Zeplin.");
};

const getConnectedBarrels = async (options: ConnectDeleteOptions): Promise<ConnectedBarrels[]> => {
    const { configFiles } = options;

    const componentConfigFiles = await getComponentConfigFiles(configFiles, []);

    return componentConfigFiles.map(ccf => ({
        projects: ccf.projects || [],
        styleguides: ccf.styleguides || []
    }));
};

export type ConnectDeleteOptions = Pick<ConnectOptions, "configFiles">;

export async function connectDelete(options: ConnectDeleteOptions): Promise<void> {
    try {
        const barrels = await getConnectedBarrels({ configFiles: options.configFiles });

        await deleteConnectedBarrels(barrels);
    } catch (error: any) {
        error.message = dedent`
            ${chalk.bold`Deleting Connected Components from Zeplin components failed.`}

            ${chalk.redBright(indent(error.message))}
        `;
        throw error;
    }
}