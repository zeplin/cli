const errorHandler = (error: Error): void => {
    if (process.env.VERBOSE) {
        console.error(error);
    } else {
        console.error(error.message);
    }

    process.exit(1);
};

type FunctionReturnsPromise = (...args: Array<any>) => Promise<void>;

function commandRunner(fn: FunctionReturnsPromise): FunctionReturnsPromise {
    return (...args: Array<any>): Promise<void> => fn(...args).catch(errorHandler);
}

export { commandRunner };
