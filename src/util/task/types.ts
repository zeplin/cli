import { Options as OraOptions } from "ora";
import { Task } from "./task";

export enum State {
    PENDING,
    COMPLETED,
    FAILED,
    SKIPPED
}

export type stringFn<T> = (ctx: T) => string;

export interface TaskUI<T = TaskContext> {
    readonly text?: string | stringFn<T>;
    readonly subtext?: string | stringFn<T>;
}

export type TaskUIFn<T> = stringFn<T> | ((context: T) => TaskUI<T>);

export type TaskUITypes<T> = void | string | TaskUI<T> | TaskUIFn<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TaskContext = any;

export type TaskStep<T = TaskContext> = (ctx: T, task: Task<T>) => TaskUITypes<T> | Promise<TaskUITypes<T>>;

export type TaskSkipFunction<T> = (ctx: T) => boolean | TaskUITypes<T> | Promise<boolean | TaskUITypes<T>>;

export interface TaskConstructor<T> {
    readonly steps: TaskStep<T>[];
    readonly initial?: TaskUITypes<T>;
    readonly skip?: TaskSkipFunction<T>;
    readonly spinnerOptions?: OraOptions;
}