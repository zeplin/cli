import { CLIError } from ".";

export class JWTError extends CLIError {
    constructor(msg: string) {
        super(msg);
    }
}
