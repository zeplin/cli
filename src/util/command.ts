import chalk from "chalk";
import dedent from "ts-dedent";
import { isVerbose } from "../util/env";
import { CLIError } from "../errors";
import logger from "../util/logger";

const waitForLoggerAndExit = (exitCode = 0): Promise<void> =>
    new Promise((resolve): void => {
        logger.on("finish", () => {
            resolve();
            process.exit(exitCode);
        });
    });

const errorHandler = (error: Error): void => {
    if (isVerbose()) {
        logger.error(`\n${chalk.redBright(error.stack)}`);
    } else {
        logger.error(`\n${chalk.redBright(error.message)}`);
        logger.debug(`${error.stack}`);
    }

    if (CLIError.isCLIError(error) && error.details) {
        if (isVerbose()) {
            logger.error(chalk.redBright(dedent`
                Details:
                ${error.details}`));
        } else {
            logger.debug(`${error.details}`);
        }
    }
    logger.info(`\nPlease check ${chalk.dim("~/.zeplin/cli.log")} for details.\n`);

    waitForLoggerAndExit(1);
};

type FunctionReturnsPromise = (...args: Array<any>) => Promise<void>;

function commandRunner(fn: FunctionReturnsPromise): FunctionReturnsPromise {
    return async (...args: Array<any>): Promise<void> => {
        await fn(...args)
            .then(() => waitForLoggerAndExit())
            .catch(errorHandler);
    };
}

export { commandRunner };
