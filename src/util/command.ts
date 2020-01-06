import chalk from "chalk";
import dedent from "ts-dedent";
import { isVerbose } from "../util/env";
import { CLIError } from "../errors";
import logger from "../util/logger";

const errorHandler = (error: Error): never => {
    logger.console("");
    logger.error(`${chalk.redBright(error.stack)}`);

    if (isVerbose()) {
        if (CLIError.isCLIError(error) && error.details) {
            logger.error(chalk.redBright(dedent`
                Details:
                ${error.details}`));
        }
    }

    logger.console(`Please check logs ${chalk.dim("~/.zeplin/cli.log")} for error details.`);

    logger.console("");
    process.exit(1);
};

type FunctionReturnsPromise = (...args: Array<any>) => Promise<void>;

function commandRunner(fn: FunctionReturnsPromise): FunctionReturnsPromise {
    return (...args: Array<any>): Promise<void> => fn(...args).catch(errorHandler);
}

export { commandRunner };
