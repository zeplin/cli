import chalk from "chalk";
import { TaskUI } from "../../util/task";
import { ResourceContext } from "../context/resource";

function resourceTypeName(ctx: ResourceContext): string {
    if (ctx.cliOptions.projectId && !ctx.cliOptions.styleguideId) {
        return "project";
    } else if (!ctx.cliOptions.projectId && ctx.cliOptions.styleguideId) {
        return "styleguide";
    }

    return "resource";
}

function resourceId(ctx: ResourceContext): string {
    return ctx.cliOptions.projectId || ctx.cliOptions.styleguideId || "";
}

export const initial = (): TaskUI => ({
    text: "Select a Zeplin resource"
});

export const retrieving = (ctx: ResourceContext): TaskUI => ({
    text: `Retrieving Zeplin ${resourceTypeName(ctx)}s...`
});

export const noMatchingResource = (ctx: ResourceContext): TaskUI => ({
    text: `Could not find matching ${resourceTypeName(ctx)} ${chalk.cyan(resourceId(ctx))}`
});

export const skippedSelection = (ctx: ResourceContext): TaskUI => ({
    text: `Selected ${ctx.selectedResource.type.toLowerCase()} ${chalk.cyan(ctx.selectedResource.name)}`,
    subtext: `You provided --${ctx.cliOptions.projectId
        ? `project-id=${ctx.cliOptions.projectId}`
        : `styleguide-id=${ctx.cliOptions.styleguideId}`}`
});

export const select = (): TaskUI => ({
    text: "Select a Zeplin resource..."
});

export const completed = (ctx: ResourceContext): TaskUI => ({
    text: `Selected ${ctx.selectedResource.type.toLowerCase()} ${ctx.selectedResource.name}`
});

export const failed = (): TaskUI => ({
    text: "Failed to select a Zeplin resource"
});
