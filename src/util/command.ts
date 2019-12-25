import dedent from "ts-dedent";
import { isVerbose } from "../util/env";

const errorHandler = (error: Error): never => {
    console.log(); // Line break before error output.
    if (isVerbose()) {
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
