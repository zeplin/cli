import { Task, transitionTo, TaskStep } from "../util/task";
import * as ui from "./ui/connect-components";
import { ConnectContext } from "./context/connect";
import { generateConnectedComponents } from "../commands";

const checkConnectIsAllowed: TaskStep<ConnectContext> = (ctx, task): void => {
    if (ctx.cliOptions.skipConnect) {
        ctx.skippedConnect = true;
        task.skip(ctx, ui.skipConnect);
    }

    if (ctx.skippedInstallingRequiredPackages) {
        ctx.skippedConnect = true;
        task.skip(ctx, ui.requiredPackagesAreNotInstalled);
    }
};

const checkAuthentication: TaskStep<ConnectContext> = (ctx): void => {
    ctx.authService.validateToken({ requiredScopes: ["write"] });
};

const connect: TaskStep<ConnectContext> = async (ctx): Promise<void> => {
    const connectedComponents = await generateConnectedComponents({
        configFiles: [ctx.cliOptions.configFile],
        plugins: ctx.installedPlugins
    });

    await ctx.connectService.uploadConnectedBarrels(connectedComponents);
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