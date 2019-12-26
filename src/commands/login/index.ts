
import chalk from "chalk";
import dedent from "ts-dedent";
import inquirer from "inquirer";

import * as envUtil from "../../util/env";
import { AuthenticationService } from "../../service/index";

export async function login(): Promise<void> {
    const tokenFromEnv = envUtil.getAccessTokenFromEnv();

    if (tokenFromEnv) {
        console.log(dedent`${chalk.dim`ZEPLIN_ACCESS_TOKEN`} is already set.
                            Remove the environment variable to login via CLI.`);
    } else {
        const authService = new AuthenticationService();

        const existingToken = authService.authenticate();
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

        await authService.promptForLogin({ ignoreSaveTokenErrors: false });

        console.log(chalk.bold("\n🦄 Successfully authenticated."));
    }
}