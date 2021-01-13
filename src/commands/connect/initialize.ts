import { Workflow } from "../../util/task";
import {
    authentication,
    detectGit,
    selectResource,
    selectComponent,
    selectFile,
    detectProjectType,
    installPackagesTask
} from "../../tasks";
import {
    AuthenticationContext,
    DetectGitContext,
    FileContext,
    ResourceContext,
    ProjectTypeContext,
    InstallPackagesContext
} from "../../tasks/context";

export interface InitializeCommandOptions {
    projectId?: string;
    styleguideId?: string;
    componentId?: string;
    filename?: string;
    type?: string[];
    output?: string;
    skipConnect?: boolean;
    skipInstall?: boolean;
}

export type InitializeContext = Partial<AuthenticationContext &
    DetectGitContext &
    ResourceContext &
    ProjectTypeContext &
    FileContext &
    InstallPackagesContext & {
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
            detectGit,
            installPackagesTask
        ]
    });

    await workflow.run();
}
