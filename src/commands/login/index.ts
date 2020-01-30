
import chalk from "chalk";
import dedent from "ts-dedent";
import inquirer from "inquirer";
import logger from "../../util/logger";

import * as envUtil from "../../util/env";
import * as authFileUtil from "../../util/auth-file";
import { AuthenticationService } from "../../service/index";

export async function login(): Promise<void> {
    const tokenFromEnv = envUtil.getAccessTokenFromEnv();

    if (tokenFromEnv) {
        logger.info(dedent`${chalk.dim`ZEPLIN_ACCESS_TOKEN`} is already set.
                            Remove the environment variable to login via CLI.`);
    } else {
        const existingToken = await authFileUtil.readAuthToken();
        if (existingToken) {
            const answer = await inquirer.prompt([{
                type: "input",
                name: "choice",
                message: "Do you want to overwrite existing authentication token? [y/N]"
            }]);

            if (answer.choice !== "y") {
                return;
            }
        }

        const authService = new AuthenticationService();
        await authService.promptForLogin({ ignoreSaveTokenErrors: false });

        logger.info(chalk.bold("\n🦄 Successfully authenticated."));
    }
}