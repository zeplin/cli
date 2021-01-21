import chalk from "chalk";
import path from "path";
import dedent from "ts-dedent";
import { defaults } from "../config/defaults";
import { InitializeContext } from "../tasks/context/initialize";
import { AddComponentContext } from "../tasks/context/add-component";

const componentLinksMessage = (ctx: InitializeContext | AddComponentContext): string => {
    const appUri = defaults.app.webURL === "https://app.zeplin.io" ? "zpl" : "zpl-test";
    const resourcePath = ctx.selectedResource.type === "Project" ? "projects" : "styleguides";
    const appResourceKey = ctx.selectedResource.type === "Project" ? "pid" : "stid";
    const resourceId = ctx.selectedResource?._id;
    const componentId = ctx.selectedComponents[0]._id;

    return dedent`
        Check out the component using the following links:
            Web: ${chalk.underline(`${defaults.app.webURL}/${resourcePath}/${resourceId}/components?coid=${componentId}`)}
            App: ${chalk.underline(`${appUri}://components?${appResourceKey}=${resourceId}&coid=${componentId}`)}
    `;
};

const connectCommandMessage = (ctx: InitializeContext | AddComponentContext): string =>
    `${ctx.installGlobally ? "zeplin connect" : `${ctx.isYarn ? "yarn" : "npm run"} zeplin-connect`}`;

const installPackagesMessage = (context: InitializeContext): string => {
    if (context.installGlobally) {
        return `${context.isYarn ? "yarn global add" : "npm -g install"} @zeplin/cli ${context.installedPlugins.join(" ")}`;
    }

    return `${context.isYarn ? "yarn" : "npm"} install`;
};

const connectSkipMessage = (ctx: InitializeContext | AddComponentContext): string => dedent`
        ${chalk.inverse(`Connecting to Zeplin is skipped. Use the following commands to connect components:`)}
            ${connectCommandMessage(ctx)}
    `;

const skipMessage = (ctx: InitializeContext): string => {
    if (ctx.cliOptions.skipInstall) {
        return dedent`
            ${chalk.inverse("Package installation is skipped.")}
            You should install all dependencies and then connect components using the following commands:
                ${installPackagesMessage(ctx)}
                ${connectCommandMessage(ctx)}
            `;
    }
    return connectSkipMessage(ctx);
};

export const alreadyInitialized = "⚠️  Found an existing Connected Components configuration. Falling back to add-component command.";

export const notInitialized = "⚠️  Looks like this project has no Connected Components configuration.";

export const userSelectedNotToInitialize = dedent`
        Operation aborted.
        Check the documentation for initialization and add-component details:
        https://github.com/zeplin/cli/blob/master/README.md"
    `;

export const initSummary = (context: InitializeContext): string => dedent`
        Configuration file is setup! 🎉
        ${chalk.underline(path.resolve(`${context.cliOptions?.configFile}`))}

        ${context.skippedConnect ? skipMessage(context) : componentLinksMessage(context)}

        Free free to update the configuration file and use the following command to connect components!
            ${connectCommandMessage(context)}

        You can use the following command to add another component interactively:
            ${connectCommandMessage(context)} add-component
    `;

export const addSummary = (context: AddComponentContext): string => dedent`
        All done! 🎉
        ${chalk.underline(path.resolve(`${context.cliOptions?.configFile}`))}

        ${context.skippedConnect ? connectSkipMessage(context) : componentLinksMessage(context)}
    `;

export const existingComponentPrompt = "Do you want to add an existing component into the configuration?";

export const initializationPrompt = "Do you want to initialize Connected Components now?";

export const selectComponentPrompt = "Which components would you like to connect?";

export const chooseAtLeastOneComponentErrorMessage = "You must choose at least one Zeplin component.";

export const selectResourcePrompt = "Which Zeplin project/styleguide would you like to setup?";

export const selectComponentFilePrompt = "Select the component file:";