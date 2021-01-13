import { Workflow } from "../../util/task";
import {
    authentication,
    detectGit,
    detectProjectType,
    installPackagesTask,
    selectComponent,
    selectFile,
    selectResource,
    generateConfig
} from "../../tasks";

import { CliOptions, InitializeContext } from "../../tasks/context/initialize";

type Context = Partial<InitializeContext>;

export type InitializeCommandOptions = CliOptions;

export async function initialize(options: InitializeCommandOptions): Promise<void> {
    const context: Context = Object.assign(Object.create(null), options);

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
            generateConfig
        ]
    });

    await workflow.run();
}
