import { TaskUITypes } from "./types";

export class TaskError<T> extends Error {
    ui: TaskUITypes<T>;
    cause?: Error;

    constructor(ui: TaskUITypes<T>, cause?: Error) {
        super("Task failed");
        this.ui = ui;
        this.cause = cause;
    }

    static isTaskError<T>(err: Error): err is TaskError<T> {
        return err instanceof TaskError;
    }
}
