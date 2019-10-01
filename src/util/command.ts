const errorHandler = (error: Error): void => {
    console.error(error.message);

    if (process.env.VERBOSE) {
        console.error(error);
    } else {
        console.log("Use --verbose to print error stack trace.");
    }

    process.exit(1);
};

type FunctionReturnsPromise = (...args: Array<any>) => Promise<void>;

function commandRunner(fn: FunctionReturnsPromise): FunctionReturnsPromise {
    return (...args: Array<any>): Promise<void> => fn(...args).catch(errorHandler);
}

export { commandRunner };
