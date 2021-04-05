
import { Task, TaskStep, transitionTo } from "../util/task";
import * as ui from "./ui/detect-git";
import { DetectGitContext } from "./context/detect-git";
import logger from "../util/logger";
import * as gitService from "../service/git";

const detect: TaskStep<DetectGitContext> = async (ctx, task) => {
    try {
        const git = await gitService.detectGit();
        if (git) {
            ctx.git = git;
            return;
        }
    } catch (e) {
        logger.debug("Error occurred while detecting git config", e);
    }

    task.skip(ctx, ui.skipped);
};

export const detectGit = new Task<DetectGitContext>({
    steps: [
        detect,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
