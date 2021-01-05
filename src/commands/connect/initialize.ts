import { Workflow } from "../../util/task";
import {
    authentication,
    detectRepository,
    selectResource,
    selectComponent
} from "../../tasks";
import {
    AuthenticationContext,
    DetectRepositoryContext,
    ResourceContext
} from "../../tasks/context";

type InitializeContext = AuthenticationContext &
    DetectRepositoryContext &
    ResourceContext & {
        projectId?: string;
        styleguideId?: string;
        componentId?: string;
        filename?: string;
        output?: string;
        skipConnect?: boolean;
    }

export interface InitializeOptions {
    projectId?: string;
    styleguideId?: string;
    componentId?: string;
    filename?: string;
    output?: string;
    skipConnect?: boolean;
}

export async function initialize(options: InitializeOptions): Promise<void> {
    const context: InitializeContext = Object.assign(Object.create(null), options);

    const workflow = new Workflow({
        context,
        tasks: [
            authentication,
            detectRepository,
            selectResource,
            selectComponent
        ]
    });

    await workflow.run();
}