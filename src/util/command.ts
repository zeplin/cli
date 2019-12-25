import chalk from "chalk";
import dedent from "ts-dedent";
import { isVerbose } from "../util/env";
import { CLIError } from "../errors";

const errorHandler = (error: Error): never => {
    console.log(); // Line break before error output.
    if (isVerbose()) {
        console.error(chalk.redBright(error.stack));

        if (CLIError.isCLIError(error) && error.details) {
            console.error(chalk.redBright(dedent`
                Details:
                ${error.details}`));
        }
    } else {
        console.error(dedent`
            ${chalk.redBright(error.message)}

            Use --verbose flag for detailed error output.
        `);
    }

    console.log();
    process.exit(1);
};

type FunctionReturnsPromise = (...args: Array<any>) => Promise<void>;

function commandRunner(fn: FunctionReturnsPromise): FunctionReturnsPromise {
    return (...args: Array<any>): Promise<void> => fn(...args).catch(errorHandler);
}

export { commandRunner };
