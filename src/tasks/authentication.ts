import { Task, TaskStep, pauseSpinningAndExecuteTask, transitionTo } from "../util/task";
import * as ui from "./ui/authentication";
import { AuthenticationContext } from "./context/authentication";
import { isCI } from "../util/env";
import { isAuthenticationError } from "../util/error";
import dedent from "ts-dedent";
import chalk from "chalk";
import logger from "../util/logger";

const checkAuthentication: TaskStep<AuthenticationContext> = (ctx, task): void => {
    if (ctx.auth) {
        task.skip(ctx, ui.alreadyAuthenticated);
    }
};

const authenticate: TaskStep<AuthenticationContext> = async (ctx): Promise<void> => {
    const requiredScopes = ["read", "write"];
    try {
        ctx.auth = await ctx.authService.authenticate({ requiredScopes });
    } catch (error: any) {
        if (isAuthenticationError(error)) {
            if (isCI()) {
                error.message = dedent`
                    ${error.message}
                    Please update ${chalk.dim`ZEPLIN_ACCESS_TOKEN`} environment variable.
                `;
            } else {
                logger.info(error.message);
                ctx.auth = await ctx.authService.promptForLogin({ requiredScopes, forceRenewal: true });
                return;
            }
        }
        throw error;
    }
};

export const authentication = new Task<AuthenticationContext>({
    steps: [
        checkAuthentication,
        transitionTo(ui.authenticating),
        pauseSpinningAndExecuteTask(authenticate),
        transitionTo(ui.authenticated)
    ],
    initial: ui.initial
});
