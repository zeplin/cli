import { TaskUI } from "../../util/task/types";
import { ProjectTypeContext } from "../context/project-type";

function projectTypesText(ctx: ProjectTypeContext): string {
    return ctx.projectTypes && ctx.projectTypes.length > 1
        ? `project types: ${ctx.projectTypes.map(pt => pt.type).join(", ")}`
        : `project type: ${ctx.projectTypes[0].type}`;
}

export const initial = (): TaskUI => ({
    text: "Detect project type"
});

export const skippedDetection = (ctx: ProjectTypeContext): TaskUI => ({
    text: `Selected ${projectTypesText(ctx)}`,
    subtext: `You provided ${ctx.projectTypes?.map(t => `--type=${t.type}`).join(" ")}`
});

export const detecting = (): TaskUI => ({
    text: "Detecting project type..."
});

export const completed = (ctx: ProjectTypeContext): TaskUI => ({
    text: `Detected ${projectTypesText(ctx)}`
});
