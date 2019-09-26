export class CLIError extends Error {
    constructor(msg?: string) {
        const message = `${msg || "CLI Error."}`;
        super(message);
    }
}
