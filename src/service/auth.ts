import chalk from "chalk";
import jwt from "jsonwebtoken";
import inquirer from "inquirer";
import open from "open";
import { URL } from "url";
import { ZeplinApi } from "../api";
import { AuthError } from "../errors";
import * as authFileUtil from "../util/auth-file";
import * as envUtil from "../util/env";
import logger from "../util/logger";
import { LoginAuthServer } from "../commands/login/server";
import { defaults } from "../config/defaults";

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
    loginServer = new LoginAuthServer(defaults.app.authRedirectPath);

    async authenticate({
        requiredScopes = [], noBrowser = false
    }: {
        requiredScopes?: string[]; noBrowser?: boolean;
    } = {}): Promise<string> {
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

                this.authToken = await this.promptForLogin({ noBrowser });
            }
        }

        return validate(this.authToken, requiredScopes);
    }

    async promptForLogin({
        ignoreSaveTokenErrors = true, noBrowser = false
    }: {
        ignoreSaveTokenErrors?: boolean; noBrowser?: boolean;
    } = {}): Promise<string> {
        logger.info("\nLogin into Zeplin…");

        let authToken: string | undefined;

        if (!noBrowser) {
            authToken = await this.promptForBrowserLogin();

            if (!authToken) {
                logger.info("Login via browser is failed. Please type in your Zeplin credentials to login.");

                authToken = await this.promptForCLILogin();
            }
        } else {
            authToken = await this.promptForCLILogin();
        }

        authToken = validate(authToken);

        try {
            await authFileUtil.saveAuthToken(authToken);
        } catch (err) {
            logger.debug(`${err.stack}`);
            if (!ignoreSaveTokenErrors) {
                throw err;
            }
        }

        return authToken;
    }

    async promptForBrowserLogin(): Promise<string | undefined> {
        const authUrl = new URL("/oauth/authorize", defaults.app.webURL);

        authUrl.searchParams.append("client_id", defaults.api.clientId);
        authUrl.searchParams.append("scope", "read+write+delete");
        authUrl.searchParams.append("redirect_uri", defaults.app.webAuthRedirectURL);

        await open(authUrl.toString());

        const prompt = inquirer.prompt([{
            type: "input",
            name: "token",
            message: "Paste your access token here",
            validate: notEmptyValidator("Please enter your access token.")
        }]);

        /**
         * Zeplin should redirect to local login server with authorization token;
         * however, if redirection fails user should be able to paste the token from their browser.
         *
         * Since we don't know which will happen first, we race the promises for both conditions.
         */
        const accessToken = await Promise.race([
            // Run auth server
            this.loginServer.waitForToken({ port: defaults.commands.login.port })
                .then(token => token)
                .catch(err => {
                    logger.error(err);
                    this.loginServer.stop();
                }),
            // Wait for paste prompt
            prompt
                .then((answer: { token: string }) => answer.token)
                .catch(err => { logger.error(err); })
        ]);

        // Cleanup
        await this.loginServer.stop();
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (prompt.ui as any)?.close();
        } catch (_) {
            // Ignore
        }

        return accessToken as string;
    }

    async promptForCLILogin(): Promise<string | undefined> {
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

        return this.zeplinApi.generateToken(loginResponse.token);
    }
}
