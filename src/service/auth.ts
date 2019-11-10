import jwt from "jsonwebtoken";
import inquirer from "inquirer";
import { ZeplinApi } from "../api";
import { AuthError } from "../errors";
import * as authFileUtil from "../util/auth-file";
import * as envUtil from "../util/env";

function notEmptyValidator(errorMessage: string) {
    return (input: string): boolean | string => (input && input.length > 0 ? true : errorMessage);
}

type JWT = { [key: string]: string | number | boolean };

// Just a sanity check
const validate = (authToken: string | undefined): string => {
    if (!authToken) {
        throw new AuthError("No authentication token is found.");
    }

    const decodedToken = jwt.decode(authToken, { complete: false }) as JWT;
    if (!decodedToken) {
        throw new AuthError("Invalid authentication token.");
    }

    const [, userId] = (decodedToken.aud as string).split(":");
    if (!userId) {
        throw new AuthError("Audience is not set in authentication token.");
    }

    return authToken;
};

export class AuthenticationService {
    authToken?: string;
    zeplinApi = new ZeplinApi();

    async authenticate(): Promise<string> {
        const tokenFromEnv = envUtil.getAccessTokenFromEnv();

        if (tokenFromEnv) {
            this.authToken = tokenFromEnv;
        } else if (!envUtil.isCI()) {
            const tokenFromFile = await authFileUtil.readAuthToken();

            if (tokenFromFile) {
                this.authToken = tokenFromFile;
            } else {
                console.log("Looks like no authentication token has been found in the environment.");
                await this.promptForLogin();
            }
        }

        return validate(this.authToken);
    }

    async getToken(): Promise<string> {
        if (!this.authToken) {
            this.authToken = await this.authenticate();
        }

        return validate(this.authToken);
    }

    async promptForLogin(): Promise<string> {
        console.log("Login into Zeplin...");
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

        authFileUtil.saveAuthToken(authToken);

        this.authToken = authToken;

        return validate(this.authToken);
    }
}