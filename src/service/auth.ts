import jwt from "jsonwebtoken";
import inquirer from "inquirer";
import { ZeplinApi } from "../api";
import { JWTError } from "../errors";
import { LoginRequest } from "../api/interfaces";

function notEmptyValidator(errorMessage: string) {
    return (input: string): boolean | string => (input && input.length > 0 ? true : errorMessage);
}

export class AuthenticationService {
    handle?: string;
    password?: string;
    token?: string;
    zeplinApi: ZeplinApi = new ZeplinApi();

    constructor(params?: { handle?: string; password?: string; token?: string }) {
        if (params) {
            this.handle = params.handle;
            this.password = params.password;
            this.token = params.token;
        }
    }

    async authenticate(): Promise<string> {
        if (!this.token) {
            if (!this.handle || !this.password) {
                const credentials = await this.promptForLogin();

                this.handle = credentials.handle;
                this.password = credentials.password;
            }

            const response = await this.zeplinApi.login({
                handle: this.handle,
                password: this.password
            });

            this.token = response.token;
        }

        return AuthenticationService.decodeJwt(this.token);
    }

    async getToken(): Promise<string> {
        if (!this.token) {
            this.token = await this.authenticate();
        }

        return this.token;
    }

    private async promptForLogin(): Promise<LoginRequest> {
        console.log("Looks like no login credentials has been found in environment variables.");
        console.log("We need to make you login to Zeplin.");

        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "handle",
                message: "Username/Email",
                validate: notEmptyValidator("Please enter username or email.")
            },
            {
                type: "password",
                name: "password",
                message: "Password",
                validate: notEmptyValidator("Please enter your password.")
            }
        ]);

        return answers;
    }

    private static decodeJwt(token: string): string {
        const { aud } = jwt.decode(token, { complete: false }) as { aud: string };
        if (!aud) {
            throw new JWTError("Invalid authentication token");
        }
        const [, userId] = aud.split(":");
        if (!userId) {
            throw new JWTError("Invalid authentication token");
        }

        return token;
    }
}