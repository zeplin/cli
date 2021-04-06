import chalk from "chalk";
import inquirer from "inquirer";
import dedent from "ts-dedent";
import {
    addComponentConfig,
    authentication,
    selectComponent,
    selectFile,
    selectResource,
    connectComponents,
    detectEnvironment
} from "../../tasks";
import { CliOptions, AddComponentContext } from "../../tasks/context/add-component";
import { Workflow } from "../../util/task";
import { indent, stringify } from "../../util/text";
import { AuthenticationService } from "../../service";
import { ConnectedComponentsService } from "./service";
import logger from "../../util/logger";
import { notInitialized, userSelectedNotToInitialize, addSummary, initializationPrompt } from "../../messages";
import { getComponentConfigFiles } from "./config";
import { initialize } from "./initialize";
import { commandRunner } from "../../util/commander";

const askForInitialization = async (): Promise<boolean> => {
    const { confirmation } = await inquirer.prompt([{
        type: "confirm",
        message: initializationPrompt,
        default: false,
        name: "confirmation"
    }]);

    return confirmation;
};

export type AddComponentCommandOptions = CliOptions;

export async function addComponent(options: AddComponentCommandOptions): Promise<void> {
    try {
        logger.debug(`add-commponents options: ${stringify(options)}`);

        const authService = new AuthenticationService();
        const connectService = new ConnectedComponentsService({ authService });

        const context: AddComponentContext = Object.assign(Object.create(null), {
            cliOptions: options
        }, {
            authService,
            connectService
        });

        const [existingConfigFile] = await getComponentConfigFiles([context.cliOptions.configFile])
            .catch(err => {
                logger.debug(err.stack);
                return [];
            });

        if (!existingConfigFile) {
            logger.info(notInitialized);
            if (!(await askForInitialization())) {
                logger.info(userSelectedNotToInitialize);
                return;
            }

            return commandRunner(() => initialize(options))();
        }

        context.configFile = existingConfigFile;

        const workflow = new Workflow({
            context,
            tasks: [
                authentication,
                selectResource,
                selectComponent,
                selectFile,
                detectEnvironment,
                addComponentConfig,
                connectComponents
            ]
        });

        await workflow.run();

        logger.info(addSummary(context));
    } catch (error) {
        error.message = dedent`
            ${chalk.bold`Adding connected component failed.`}

            ${chalk.redBright(indent(error.message))}
        `;
        throw error;
    }
}
