import { Workflow } from "../../util/task";
import { detectRepository } from "../../tasks";
import { DetectRepositoryContext } from "../../tasks/context";

type InitializeContext = DetectRepositoryContext & {
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
            detectRepository
        ]
    });

    await workflow.run();
}