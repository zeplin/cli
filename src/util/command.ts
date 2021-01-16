import execa from "execa";
import logger from "./logger";

export async function runCommand(
    command: string,
    { ignoreError = false, ...opts }: { ignoreError?: boolean } & execa.Options = {}
): Promise<string | null> {
    logger.debug(`Running command: ${command}`);

    try {
        const { stdout } = await execa.command(command, opts);

        logger.debug(`Command output: ${stdout}`);
        return stdout;
    } catch (e) {
        logger.error("Command error:", e);
        if (!ignoreError) {
            throw e;
        }
        return null;
    }
}
