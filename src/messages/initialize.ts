import chalk from "chalk";
import path from "path";
import dedent from "ts-dedent";
import { defaults } from "../config/defaults";
import { InitializeContext } from "../tasks/context/initialize";

const componentLinksMessage = (ctx: InitializeContext): string => {
    const appUri = defaults.app.webURL === "https://app.zeplin.io" ? "zpl" : "zpl-test";
    const resourcePath = ctx.selectedResource.type === "Project" ? "projects" : "styleguides";
    const appResourceKey = ctx.selectedResource.type === "Project" ? "pid" : "stid";
    const resourceId = ctx.selectedResource?._id;
    const componentId = ctx.selectedComponents[0]._id;

    return dedent`
        Check out them using the following links:
            Web: ${chalk.underline(`${defaults.app.webURL}/${resourcePath}/${resourceId}/components?coid=${componentId}`)}
            App: ${chalk.underline(`${appUri}://components?${appResourceKey}=${componentId}&coid=${componentId}`)}
    `;
};

const connectCommandMessage = (ctx: InitializeContext): string =>
    `${ctx.installedGlobally ? "zeplin connect" : `${ctx.isYarn ? "yarn" : "npm run"} zeplin-connect`}`;

const installPackagesMessage = (context: InitializeContext): string => `${context.isYarn ? "yarn" : "npm"} install`;

const skipMessage = (ctx: InitializeContext): string => {
    if (ctx.skippedInstallingRequiredPackages) {
        return dedent`
            ${chalk.inverse("Package installation is skipped.")}
            You should install all dependencies and then connect components using the following commands:
                ${installPackagesMessage(ctx)}
                ${connectCommandMessage(ctx)}
            `;
    }
    return dedent`
        ${chalk.inverse(`Connecting to Zeplin is skipped. Use the following commands to connect components:`)}
            ${connectCommandMessage(ctx)}
    `;
};

export const alreadyInitialized = (): string =>
    "⚠️ Found an existing connected components configuration. Falling back to add-component command";

export const notInitialized = (): string =>
    "⚠️ It seems the project has no connected components configuration.";

export const summary = (context: InitializeContext): string => dedent`
        Configuration file is setup in ${chalk.underline(path.resolve(`${context.cliOptions?.configFile}`))}

        ${context.skippedConnect ? skipMessage(context) : componentLinksMessage(context)}

        Free free to update the configuration file and use the following command connect components!
            ${connectCommandMessage(context)}

        You can use the following command to add another component interactively:
            ${connectCommandMessage(context)} add-component
    `;
