import chalk from "chalk";
import { TaskUI } from "../../util/task";
import { ResourceContext } from "../context/resource";

export const initial = (): TaskUI => ({
    text: "Select a Zeplin component"
});

export const retrieving = (): TaskUI => ({
    text: "Retrieving Zeplin components..."
});

export const foundNoComponents = (ctx: ResourceContext): TaskUI => ({
    text: `No components found in ${ctx.selectedResource.name}`
});

export const skippedSelection = (ctx: ResourceContext): TaskUI => ({
    text: `Selected ${chalk.cyan(ctx.selectedComponents?.map(c => c.name)[0])}`,
    subtext: `You provided --component-id=${ctx.componentId}`
});

export const noMatchingComponent = (ctx: ResourceContext): TaskUI => ({
    text: `Could not find matching component ${chalk.cyan(ctx.componentId)}`
});

export const select = (ctx: ResourceContext): TaskUI => ({
    text: "Select a Zeplin component...",
    subtext: `${ctx.selectedResource.type}: ${ctx.selectedResource.name}`
});

export const completed = (ctx: ResourceContext): TaskUI => ({
    text: `Selected Zeplin ${ctx.selectedComponents.length > 0 ? "components" : "component"}:`,
    subtext: `${ctx.selectedComponents?.map(c => c.name).join("\n")}`
});

export const failed = (): TaskUI => ({
    text: "Failed to select a Zeplin component"
});
