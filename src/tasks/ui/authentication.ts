import chalk from "chalk";
import { TaskUI } from "../../util/task/types";
import { AuthenticationContext } from "../context/authentication";
import { AUTH_METHOD } from "../../service/auth";

const authenticatedSubtext = (ctx: AuthenticationContext): string | undefined => {
    let subtext;
    switch (ctx.auth?.method) {
        case AUTH_METHOD.ENVIRONMENT_VARIABLE:
            subtext = `Authenticated using ${chalk.dim("ZEPLIN_ACCESS_TOKEN")} environment variable.`;
            break;
        case AUTH_METHOD.LOGIN_WITH_BROWSER:
            subtext = `Authenticated using browser login.`;
            break;
        case AUTH_METHOD.LOGIN_WITH_PROMPT:
            subtext = `Authenticated using user credentials.`;
            break;
        case AUTH_METHOD.LOCAL_AUTH_FILE:
            subtext = `Authenticated using local authentication file.`;
            break;
        default:
            break;
    }

    return subtext;
};

export const initial = (): TaskUI => ({
    text: "Getting authentication info..."
});

export const alreadyAuthenticated = (ctx: AuthenticationContext): TaskUI => ({
    text: "Already authenticated",
    subtext: authenticatedSubtext(ctx)
});

export const authenticating = (): TaskUI => ({
    text: "Could not retrieve authentication info",
    subtext: "Authenticating..."
});

export const authenticated = (ctx: AuthenticationContext): TaskUI => ({
    text: "Successfully authenticated",
    subtext: authenticatedSubtext(ctx)
});

export const failed = (): TaskUI => ({
    text: "Could not find authentication token"
});
