import { finishLogger } from "./logger";

const gracefulExit = async (exitCode = 0): Promise<never> => {
    await finishLogger();
    process.exit(exitCode);
};

export {
    gracefulExit
};