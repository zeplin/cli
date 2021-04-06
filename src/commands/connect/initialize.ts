import chalk from "chalk";
import dedent from "ts-dedent";
import {
    authentication,
    detectGit,
    detectProjectType,
    installPackage,
    selectComponent,
    selectFile,
    selectResource,
    generateConfig,
    connectComponents
} from "../../tasks";
import { CliOptions, InitializeContext } from "../../tasks/context/initialize";
import { Workflow } from "../../util/task";
import { indent, stringify } from "../../util/text";
import { AuthenticationService } from "../../service";
import { ConnectedComponentsService } from "./service";
import logger from "../../util/logger";
import { initSummary, alreadyInitialized } from "../../messages/initialize";
import { getComponentConfigFiles } from "./config";
import { defaults } from "../../config/defaults";
import { commandRunner } from "../../util/commander";
import { addComponent } from "./addComponent";

export type InitializeCommandOptions = CliOptions;

export async function initialize(options: InitializeCommandOptions): Promise<void> {
    try {
        logger.debug(`initialize options: ${stringify(options)}`);

        const authService = new AuthenticationService();
        const connectService = new ConnectedComponentsService({ authService });

        const context: InitializeContext = Object.assign(Object.create(null), {
            cliOptions: options
        }, {
            authService,
            connectService
        });

        const [existingConfigFile] = await getComponentConfigFiles([defaults.commands.initialize.filePath])
            .catch(err => {
                logger.debug(err.stack);
                return [];
            });

        if (existingConfigFile) {
            logger.info(alreadyInitialized);
            return commandRunner(() => addComponent(options))();
        }

        const workflow = new Workflow({
            context,
            tasks: [
                authentication,
                detectProjectType,
                selectResource,
                selectComponent,
                selectFile,
                detectGit,
                installPackage,
                generateConfig,
                connectComponents
            ]
        });

        await workflow.run();

        logger.info(initSummary(context));
    } catch (error) {
        error.message = dedent`
            ${chalk.bold`Initializing Connected Components failed.`}

            ${chalk.redBright(indent(error.message))}
        `;
        throw error;
    }
}
