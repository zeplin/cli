
import * as envUtil from "../../util/env";
import { AuthenticationService } from "../../service/index";
import inquirer from "inquirer";

export async function login(): Promise<void> {
    const tokenFromEnv = envUtil.getAccessTokenFromEnv();

    if (tokenFromEnv) {
        console.log("ZEPLIN_ACCESS_TOKEN is already set.\n" +
            "Remove the environment variable to set it using CLI.");
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

        await authService.promptForLogin();
    }
}