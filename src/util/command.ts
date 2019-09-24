/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
const errorHandler = (error: Error): void => {
    console.error(error.message);

    if (process.env.VERBOSE) {
        console.error(error);
    } else {
        console.log("Use --verbose to print error stack trace.");
    }

    process.exit(1);
};

const commandRunner = (fn: (...args: any) => Promise<any>): any => (...args: any) => fn(...args).catch(errorHandler);

export { commandRunner };
