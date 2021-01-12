import { TaskContext } from "./types";
import { Task } from "./task";

export class Workflow<T = TaskContext> {
    private readonly context: T;
    private readonly tasks: Task<TaskContext>[];

    constructor(params: { context: T; tasks: Task<TaskContext>[] }) {
        this.context = params.context;
        this.tasks = params.tasks;
    }

    async run(): Promise<T> {
        for (const task of this.tasks) {
            // eslint-disable-next-line no-await-in-loop
            await task.run(this.context);
            console.log(); // Puts an empty line between each task
        }
        return this.context;
    }
}