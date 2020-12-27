import {
    TaskStep,
    TaskUITypes
} from "./types";

function execute<T>(
    func: TaskStep<T>,
    options: { stopSpinning: boolean } = { stopSpinning: false }
): TaskStep<T> {
    return async (ctx, task): Promise<void> => {
        if (options.stopSpinning) {
            task.stopSpinner(ctx);
            console.log();
        }

        await func(ctx, task);

        if (options.stopSpinning) {
            console.log();
            task.startSpinner(ctx);
        }
    };
}

export function transitionTo<T>(ui: TaskUITypes<T>): TaskStep<T> {
    return (): TaskUITypes<T> => ui;
}

export function executePromise<T, R>(
    func: () => PromiseLike<R>,
    options: { stopSpinning: boolean } = { stopSpinning: false }
): TaskStep<T> {
    const task: TaskStep = async () => {
        await func();
    };
    return execute(task, options);
}

export function pauseSpinningAndExecuteTask<T>(
    func: TaskStep<T>
): TaskStep<T> {
    return execute(func, { stopSpinning: true });
}

export function pauseSpinningAndExecutePromise<T, R>(func: () => Promise<R>): TaskStep<T> {
    return execute(func, { stopSpinning: true });
}

