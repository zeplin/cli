import { ProjectTypeContext } from "./context/project-type";
import { TaskStep, Task, transitionTo } from "../util/task";
import * as ui from "./ui/detect-project-type";
import { detectProjectTypes } from "../service/project-type/detect";
import { getSupportedProjectType, SupportedProjectType } from "../service/project-type/project-types";

const checkTypeFlag: TaskStep<ProjectTypeContext> = (ctx, task): void => {
    if (ctx.cliOptions.type && ctx.cliOptions.type.length > 0) {
        ctx.projectTypes = ctx.cliOptions.type
            .map(t => getSupportedProjectType(t))
            .filter(Boolean) as SupportedProjectType[];

        task.complete(ctx, ui.skippedDetection);
    }
};

const detect: TaskStep<ProjectTypeContext> = async (ctx): Promise<void> => {
    ctx.projectTypes = await detectProjectTypes();
};

export const detectProjectType = new Task<ProjectTypeContext>({
    steps: [
        checkTypeFlag,
        transitionTo(ui.detecting),
        detect,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
