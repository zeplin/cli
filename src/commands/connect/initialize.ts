import chalk from "chalk";
import dedent from "ts-dedent";
import {
    authentication,
    detectGit,
    detectProjectType,
    installPackagesTask,
    selectComponent,
    selectFile,
    selectResource,
    generateConfig,
    connectComponents
} from "../../tasks";

import { CliOptions, InitializeContext } from "../../tasks/context/initialize";
import { Workflow } from "../../util/task";
import { indent } from "../../util/text";
import { AuthenticationService } from "../../service";
import { ConnectedComponentsService } from "./service";

type Context = Partial<InitializeContext>;

export type InitializeCommandOptions = CliOptions;

export async function initialize(options: InitializeCommandOptions): Promise<void> {
    try {
        const authService = new AuthenticationService();
        const connectService = new ConnectedComponentsService({ authService });

        const context: Context = Object.assign(Object.create(null), options, {
            authService,
            connectService
        });

        const workflow = new Workflow({
            context,
            tasks: [
                authentication,
                detectProjectType,
                selectResource,
                selectComponent,
                selectFile,
                detectGit,
                installPackagesTask,
                generateConfig,
                connectComponents
            ]
        });

        await workflow.run();
    } catch (error) {
        error.message = dedent`
            ${chalk.bold`Initializing connected components failed.`}

            ${chalk.redBright(indent(error.message))}
        `;
        throw error;
    }
}
