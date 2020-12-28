import { TaskUI } from "../../util/task/types";
import { DetectRepositoryContext } from "../context/detect-repository";

export const initial = (): TaskUI => ({
    text: "Getting git repository information..."
});

export const skipped = (): TaskUI => ({
    subtext: "Could not find git repository information"
});

export const completed = (ctx: DetectRepositoryContext): TaskUI => ({
    text: `Found git repository information`,
    subtext: `${ctx.git?.owner}/${ctx.git?.repository}.`
});
