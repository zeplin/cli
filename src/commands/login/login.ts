
import chalk from "chalk";
import dedent from "ts-dedent";
import inquirer from "inquirer";
import logger from "../../util/logger";

import * as envUtil from "../../util/env";
import * as authFileUtil from "../../util/auth-file";
import { AuthenticationService, AUTH_METHOD } from "../../service/index";

export interface LoginOptions {
    noBrowser: boolean;
}

export async function login(options: LoginOptions): Promise<void> {
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

            const authService = new AuthenticationService({
                token: existingToken,
                method: AUTH_METHOD.LOCAL_AUTH_FILE
            });

            await authService.promptForLogin({
                ignoreSaveTokenErrors: false,
                noBrowser: options.noBrowser,
                forceRenewal: true
            });

            logger.info(chalk.bold("\n🦄 Successfully authenticated."));
        }
    }
}
