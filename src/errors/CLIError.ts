/* eslint-disable @typescript-eslint/no-explicit-any */
export class CLIError extends Error {
    details: any;

    constructor(message: string, details?: any) {
        super(message);
        this.details = details;
    }
}
