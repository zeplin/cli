import { TaskUI } from "../../util/task/types";
import { DetectGitContext } from "../context/detect-git";

export const initial = (): TaskUI => ({
    text: "Getting git repository information..."
});

export const skipped = (): TaskUI => ({
    subtext: "Could not find git repository information"
});

export const completed = (ctx: DetectGitContext): TaskUI => ({
    text: `Found git repository information`,
    subtext: `${ctx.git?.config.repository}`
});
