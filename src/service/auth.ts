import chalk from "chalk";
import jwt from "jsonwebtoken";
import inquirer from "inquirer";
import { ZeplinApi } from "../api";
import { AuthError } from "../errors";
import * as authFileUtil from "../util/auth-file";
import * as envUtil from "../util/env";
import logger from "../util/logger";

function notEmptyValidator(errorMessage: string) {
    return (input: string): boolean | string => (input && input.length > 0 ? true : errorMessage);
}

type JWT = { [key: string]: string | number | boolean };

// Just a sanity check
const validate = (authToken: string | undefined, requiredScopes?: string[]): string => {
    if (!authToken) {
        throw new AuthError("No authentication token is found.");
    }

    const decodedToken = jwt.decode(authToken, { complete: false }) as JWT;
    if (!decodedToken) {
        throw new AuthError("Invalid authentication token.");
    }

    const [, userId] = (decodedToken.aud as string || "").split(":");
    if (!userId) {
        throw new AuthError("Audience is not set in authentication token.");
    }

    if (!requiredScopes) {
        return authToken;
    }

    const scopes = decodeURI((decodedToken.scope as string || "")).split(" ");

    const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope));

    if (missingScopes.length > 0) {
        logger.debug(`Missing ${missingScopes.join(", ")} scope${missingScopes.length === 1 ? "" : "s"} in authentication token.`);

        throw new AuthError("Access token has missing privileges, please login again to re-create access token.");
    }

    return authToken;
};

export class AuthenticationService {
    authToken?: string;
    zeplinApi = new ZeplinApi();

    async authenticate(requiredScopes?: string[]): Promise<string> {
        const tokenFromEnv = envUtil.getAccessTokenFromEnv();

        if (tokenFromEnv) {
            logger.debug(`Found access token from ZEPLIN_ACCESS_TOKEN env var. value: ${tokenFromEnv}`);
            this.authToken = tokenFromEnv;
        } else if (!envUtil.isCI()) {
            const tokenFromFile = await authFileUtil.readAuthToken();
            if (tokenFromFile) {
                logger.debug(`Found access token from auth file. value: ${tokenFromFile}`);
                this.authToken = tokenFromFile;
            } else {
                logger.info(`Access token not found in ${chalk.dim`ZEPLIN_ACCESS_TOKEN`} environment variable.`);
                this.authToken = await this.promptForLogin();
            }
        }

        return validate(this.authToken, requiredScopes);
    }

    async promptForLogin(
        options: { ignoreSaveTokenErrors: boolean } = { ignoreSaveTokenErrors: true }
    ): Promise<string> {
        logger.info("\nLogin into Zeplin…");
        const credentials = await inquirer.prompt([
            {
                type: "input",
                name: "handle",
                message: "Username/Email",
                validate: notEmptyValidator("Please enter your username or email.")
            },
            {
                type: "password",
                name: "password",
                message: "Password",
                validate: notEmptyValidator("Please enter your password.")
            }
        ]);

        const loginResponse = await this.zeplinApi.login({ ...credentials });

        const authToken = await this.zeplinApi.generateToken(loginResponse.token);

        validate(authToken);

        try {
            await authFileUtil.saveAuthToken(authToken);
        } catch (err) {
            logger.debug(`${err.stack}`);
            if (!options.ignoreSaveTokenErrors) {
                throw err;
            }
        }

        return authToken;
    }
}