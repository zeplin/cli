import { Workflow } from "../../util/task";
import {
    authentication,
    detectRepository,
    selectResource,
    selectComponent,
    selectFile
} from "../../tasks";
import {
    AuthenticationContext,
    DetectRepositoryContext,
    FileContext,
    ResourceContext
} from "../../tasks/context";
import { detectProjectType } from "../../tasks/detect-project-type";

export interface InitializeCommandOptions {
    projectId?: string;
    styleguideId?: string;
    componentId?: string;
    filename?: string;
    output?: string;
    skipConnect?: boolean;
}

export type InitializeContext = Partial<AuthenticationContext &
    DetectRepositoryContext &
    ResourceContext &
    FileContext & {
        cliOptions: InitializeCommandOptions;
    }>;

export async function initialize(options: InitializeCommandOptions): Promise<void> {
    const context: InitializeContext = Object.assign(Object.create(null), options);

    const workflow = new Workflow({
        context,
        tasks: [
            authentication,
            detectRepository,
            selectResource,
            selectComponent,
            selectFile
        ]
    });

    await workflow.run();
}
