import { CLIError } from ".";

export class AuthError extends CLIError {
    constructor(msg: string) {
        super(msg);
    }

    static isAuthError(err: Error): err is AuthError {
        return err instanceof AuthError;
    }
}
