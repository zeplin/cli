import { Task, transitionTo, TaskStep } from "../util/task";
import * as ui from "./ui/connect-components";
import { ConnectContext } from "./context/connect";
import { generateConnectedComponents } from "../commands";
import { runCommand } from "../util/command";
import { removeNpxFromPath } from "../util/npx";
import logger from "../util/logger";

const checkConnectIsAllowed: TaskStep<ConnectContext> = (ctx, task): void => {
    if (ctx.cliOptions.skipConnect) {
        logger.debug("Connect skipped due to --skip-connect flag");
        ctx.skippedConnect = true;
        task.skip(ctx, ui.skipConnect);
    }

    if (ctx.cliOptions.skipInstall) {
        logger.debug("Connect skipped due to --skip-install flag");
        ctx.skippedConnect = true;
        task.skip(ctx, ui.requiredPackagesAreNotInstalled);
    }
};

const checkAuthentication: TaskStep<ConnectContext> = (ctx): void => {
    ctx.authService.validateToken({ requiredScopes: ["write"] });
};

const connect: TaskStep<ConnectContext> = async (ctx): Promise<void> => {
    if (ctx.installGlobally && ctx.installedPlugins.length > 0) {
        logger.debug("Running connect by spawning the CLI");
        await runCommand(`zeplin connect --file ${ctx.cliOptions.configFile}`,
            {
                shell: true,
                env: Object.assign(process.env, { PATH: removeNpxFromPath(process.env.PATH) })
            });
    } else {
        logger.debug("Running connect internally");
        const connectedComponents = await generateConnectedComponents({
            configFiles: [ctx.cliOptions.configFile]
        });

        await ctx.connectService.uploadConnectedBarrels(connectedComponents, { force: ctx.cliOptions.force });
    }
};

export const connectComponents = new Task<ConnectContext>({
    steps: [
        checkConnectIsAllowed,
        checkAuthentication,
        connect,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
