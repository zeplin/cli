import { Workflow } from "../../util/task";
import {
    authentication,
    detectRepository
} from "../../tasks";
import {
    AuthenticationContext,
    DetectRepositoryContext
} from "../../tasks/context";

type InitializeContext = AuthenticationContext &
    DetectRepositoryContext & {
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
            detectRepository
        ]
    });

    await workflow.run();
}