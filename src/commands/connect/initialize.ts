import { Workflow } from "../../util/task";

interface InitializeContext {
    projectId?: string;
    styleguideId?: string;
    componentId?: string;
    filename?: string;
    output: string;
    skipConnect: boolean;
}

export interface InitializeOptions {
    projectId?: string;
    styleguideId?: string;
    componentId?: string;
    filename?: string;
    output?: string;
}

export async function initialize(options: InitializeOptions): Promise<void> {
    const context: InitializeContext = Object.assign(Object.create(null), options);

    const workflow = new Workflow({
        context,
        tasks: []
    });

    await workflow.run();
}