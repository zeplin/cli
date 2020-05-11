import chalk from "chalk";
import dedent from "ts-dedent";
import os from "os";
import path from "path";
import { isVerbose } from "../util/env";
import { CLIError } from "../errors";
import logger, { loggerFinishAndExit } from "../util/logger";

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

    return loggerFinishAndExit(1);
};

type FunctionReturnsPromise = (...args: Array<any>) => Promise<void>;

function commandRunner(fn: FunctionReturnsPromise): FunctionReturnsPromise {
    return (...args: Array<any>): Promise<void> =>
        fn(...args)
            .then(() => loggerFinishAndExit())
            .catch(errorHandler);
}

export { commandRunner };
