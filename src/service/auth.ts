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
import { LoginServer } from "../server";
import { defaults } from "../config/defaults";

function notEmptyValidator(errorMessage: string) {
    return (input: string): boolean | string => (input && input.length > 0 ? true : errorMessage);
}

type JWT = { [key: string]: string | number | boolean };

const validate = (authentication: Authentication | undefined, requiredScopes?: string[]): Authentication => {
    if (!authentication || !authentication.token) {
        throw new AuthError("No authentication token is found.");
    }

    const decodedToken = jwt.decode(authentication.token, { complete: false }) as JWT;
    if (!decodedToken) {
        throw new AuthError("Invalid authentication token.");
    }

    const [, userId] = (decodedToken.aud as string || "").split(":");
    if (!userId) {
        throw new AuthError("Audience is not set in authentication token.");
    }

    if (!requiredScopes) {
        return authentication;
    }

    const scopes = decodeURI((decodedToken.scope as string || "")).split(" ");

    const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope));

    if (missingScopes.length > 0) {
        logger.debug(`Missing ${missingScopes.join(", ")} scope${missingScopes.length === 1 ? "" : "s"} in authentication token.`);

        throw new AuthError("Access token has missing privileges, please login again to re-create access token.");
    }

    return authentication;
};

export enum AUTH_METHOD {
    ENVIRONMENT_VARIABLE,
    LOCAL_AUTH_FILE,
    LOGIN_WITH_PROMPT,
    LOGIN_WITH_BROWSER,
    UNKNOWN
}

export interface Authentication {
    token: string;
    method: AUTH_METHOD;
}

export class AuthenticationService {
    authentication?: Authentication;
    zeplinApi = new ZeplinApi();
    loginServer = new LoginServer(defaults.app.authRedirectPath);

    async authenticate({
        requiredScopes = [], noBrowser = false
    }: {
        requiredScopes?: string[]; noBrowser?: boolean;
    } = {}): Promise<Authentication> {
        if (this.authentication) {
            return this.authentication;
        }

        if (!this.authentication) {
            const tokenFromEnv = envUtil.getAccessTokenFromEnv();

            if (tokenFromEnv) {
                logger.debug(`Found access token from ZEPLIN_ACCESS_TOKEN env var. value: ${tokenFromEnv}`);
                this.authentication = {
                    token: tokenFromEnv,
                    method: AUTH_METHOD.ENVIRONMENT_VARIABLE
                };
            } else if (!envUtil.isCI()) {
                const tokenFromFile = await authFileUtil.readAuthToken();
                if (tokenFromFile) {
                    logger.debug(`Found access token from auth file. value: ${tokenFromFile}`);
                    this.authentication = {
                        token: tokenFromFile,
                        method: AUTH_METHOD.LOCAL_AUTH_FILE
                    };
                } else {
                    logger.info(`Access token not found in ${chalk.dim`ZEPLIN_ACCESS_TOKEN`} environment variable.`);

                    this.authentication = await this.promptForLogin({ noBrowser });
                }
            }
        }

        return validate(this.authentication, requiredScopes);
    }

    validateToken({ requiredScopes = [] }: { requiredScopes?: string[] } = {}): Authentication {
        return validate(this.authentication, requiredScopes);
    }

    async promptForLogin({
        requiredScopes = [], ignoreSaveTokenErrors = true, noBrowser = false
    }: {
        requiredScopes?: string[]; ignoreSaveTokenErrors?: boolean; noBrowser?: boolean;
    } = {}): Promise<Authentication> {
        logger.info("\nLogin into Zeplin…");

        if (!noBrowser) {
            this.authentication = await this.promptForBrowserLogin();

            if (!this.authentication.token) {
                logger.info("Login via browser is failed. Please type in your Zeplin credentials to login.");

                this.authentication = await this.promptForCLILogin();
            }
        } else {
            this.authentication = await this.promptForCLILogin();
        }

        validate(this.authentication, requiredScopes);

        try {
            await authFileUtil.saveAuthToken(this.authentication.token);
        } catch (err) {
            logger.debug(`${err.stack}`);
            if (!ignoreSaveTokenErrors) {
                throw err;
            }
        }

        return this.authentication;
    }

    async promptForBrowserLogin(): Promise<Authentication> {
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

        const token = accessToken as string;

        return {
            token,
            method: AUTH_METHOD.LOGIN_WITH_BROWSER
        };
    }

    async promptForCLILogin(): Promise<Authentication> {
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

        const token = await this.zeplinApi.generateToken(loginResponse.token);

        return {
            token,
            method: AUTH_METHOD.LOGIN_WITH_PROMPT
        };
    }
}
