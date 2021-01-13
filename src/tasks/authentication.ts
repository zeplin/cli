import { Task, TaskStep, pauseSpinningAndExecuteTask, transitionTo } from "../util/task";
import * as ui from "./ui/authentication";
import { AuthenticationContext } from "./context/authentication";

const checkAuthentication: TaskStep<AuthenticationContext> = (ctx, task): void => {
    if (ctx.auth) {
        task.skip(ctx, ui.alreadyAuthenticated);
    }
};

const authenticate: TaskStep<AuthenticationContext> = async (ctx): Promise<void> => {
    const authentication = await ctx.authService.authenticate({ requiredScopes: ["read", "write"] });
    ctx.auth = authentication;
};

export const authentication = new Task({
    steps: [
        checkAuthentication,
        transitionTo(ui.authenticating),
        pauseSpinningAndExecuteTask(authenticate),
        transitionTo(ui.authenticated)
    ],
    initial: ui.initial
});
