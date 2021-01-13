import { Workflow } from "../../util/task";
import {
    authentication,
    detectGit,
    selectResource,
    selectComponent,
    selectFile,
    detectProjectType
} from "../../tasks";
import {
    AuthenticationContext,
    DetectGitContext,
    FileContext,
    ResourceContext,
    ProjectTypeContext
} from "../../tasks/context";

export interface InitializeCommandOptions {
    projectId?: string;
    styleguideId?: string;
    componentId?: string;
    filename?: string;
    type?: string[];
    output?: string;
    skipConnect?: boolean;
}

export type InitializeContext = Partial<AuthenticationContext &
    DetectGitContext &
    ResourceContext &
    ProjectTypeContext &
    FileContext & {
        cliOptions: InitializeCommandOptions;
    }>;

export async function initialize(options: InitializeCommandOptions): Promise<void> {
    const context: InitializeContext = Object.assign(Object.create(null), options);

    const workflow = new Workflow({
        context,
        tasks: [
            authentication,
            detectProjectType,
            selectResource,
            selectComponent,
            selectFile,
            detectGit
        ]
    });

    await workflow.run();
}
