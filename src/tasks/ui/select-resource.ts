import chalk from "chalk";
import { TaskUI } from "../../util/task";
import { ResourceContext } from "../context/resource";

function resourceTypeName(ctx: ResourceContext): string {
    if (ctx.projectId && !ctx.styleguideId) {
        return "project";
    } else if (!ctx.projectId && ctx.styleguideId) {
        return "styleguide";
    }

    return "resource";
}

function resourceId(ctx: ResourceContext): string {
    return ctx.projectId || ctx.styleguideId || "";
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
    subtext: `You provided --${ctx.projectId
        ? `project-id=${ctx.projectId}`
        : `styleguide-id=${ctx.styleguideId}`}`
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
