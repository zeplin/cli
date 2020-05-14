import { waitForLoggerFinish } from "./logger";

const gracefulExit = async (exitCode = 0): Promise<never> => {
    await waitForLoggerFinish();
    process.exit(exitCode);
};

export {
    gracefulExit
};