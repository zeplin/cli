import chalk from "chalk";
import dedent from "ts-dedent";
import os from "os";
import path from "path";
import { isVerbose } from "./env";
import { CLIError } from "../errors";
import logger from "./logger";
import { gracefulExit } from "./process";

const errorHandler = (error: Error): Promise<never> => {
    if (isVerbose()) {
        logger.error(`\n${chalk.redBright(error.stack)}`);
    } else {
        logger.error(`\n${chalk.redBright(error.message)}`);
        logger.debug(`${error.stack}`);
    }

    if (CLIError.isCLIError(error) && error.details) {
        const errorDetails = JSON.stringify(error.details);
        if (isVerbose()) {
            logger.error(chalk.redBright(dedent`
            Details:
            ${errorDetails}`));
        } else {
            logger.debug(`${errorDetails}`);
        }
    }

    const logFile = path.join(os.homedir(), ".zeplin", "cli.log");
    logger.info(`\nPlease check ${chalk.dim(logFile)} for details.\n`);

    return gracefulExit(1);
};

type FunctionReturnsPromise = (...args: Array<any>) => Promise<void>;

function commandRunner(fn: FunctionReturnsPromise): FunctionReturnsPromise {
    return async (...args: Array<any>): Promise<void> => {
        try {
            await fn(...args);
            await gracefulExit();
        } catch (e) {
            await errorHandler(e);
        }
    };
}

export { commandRunner };
