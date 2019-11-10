import { CLIError } from ".";

export class AuthError extends CLIError {
    constructor(msg: string) {
        super(msg);
    }
}
