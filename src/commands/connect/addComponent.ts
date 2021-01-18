import chalk from "chalk";
import inquirer from "inquirer";
import dedent from "ts-dedent";
import {
    addComponentConfig,
    authentication,
    selectComponent,
    selectFile,
    selectResource,
    connectComponents
} from "../../tasks";
import { CliOptions, AddComponentContext } from "../../tasks/context/add-component";
import { Workflow } from "../../util/task";
import { indent } from "../../util/text";
import { AuthenticationService } from "../../service";
import { ConnectedComponentsService } from "./service";
import logger from "../../util/logger";
import { notInitialized, userSelectedNotToInitialize, addSummary } from "../../messages/initialize";
import { getComponentConfigFiles } from "./config";
import { initialize } from "..";
import { commandRunner } from "../../util/commander";

const askForInitialization = async (): Promise<boolean> => {
    const { confirmation } = await inquirer.prompt([{
        type: "confirm",
        message: "Do you want to initialize now?",
        default: false,
        name: "confirmation"
    }]);

    return confirmation;
};

export type AddComponentCommandOptions = CliOptions;

export async function addComponent(options: AddComponentCommandOptions): Promise<void> {
    try {
        const authService = new AuthenticationService();
        const connectService = new ConnectedComponentsService({ authService });

        const context: AddComponentContext = Object.assign(Object.create(null), {
            cliOptions: options
        }, {
            authService,
            connectService
        });

        const [existingConfigFile] = await getComponentConfigFiles([context.cliOptions.configFile]);
        if (!existingConfigFile) {
            logger.info(notInitialized());
            if (!(await askForInitialization())) {
                logger.info(userSelectedNotToInitialize());
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
