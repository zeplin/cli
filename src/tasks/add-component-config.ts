import inquirer from "inquirer";
import { writeJsonIntoFile } from "../util/file";
import { Task, TaskStep, transitionTo } from "../util/task";
import { TaskError } from "../util/task/error";
import { AddComponentContext } from "./context/add-component";
import * as ui from "./ui/add-component-config";
import { existingComponentPrompt } from "../messages";

const confirmAddExistingComponent =
    async (ctx: AddComponentContext, task: Task<AddComponentContext>): Promise<boolean> => {
        task.stopSpinner(ctx, ui.existingComponent);

        const { confirmation } = await inquirer.prompt([{
            type: "confirm",
            message: existingComponentPrompt,
            default: false,
            name: "confirmation"
        }]);

        task.startSpinner(ctx);

        return confirmation;
    };

const addComponent: TaskStep<AddComponentContext> = async (ctx, task) => {
    const config = ctx.configFile;
    const resource = ctx.selectedResource;

    if (resource.type === "Project") {
        if (config.projects && !config.projects.includes(resource._id)) {
            config.projects.push(resource._id);
        } else {
            config.projects = [resource._id];
        }
    } else if (config.styleguides && !config.styleguides.includes(resource._id)) {
        config.styleguides.push(resource._id);
    } else {
        config.styleguides = [resource._id];
    }

    const existingComponents = config.components || [];

    const componentNameExists = !!(existingComponents.map(ec => ec.zeplinNames)
        .find(existingZeplinName =>
            ctx.selectedComponents.find(sc => existingZeplinName?.includes(sc.name))
        ));

    const componentIdExists = !!(existingComponents.map(ec => ec.zeplinIds)
        .find(existingZeplinId =>
            ctx.selectedComponents.find(sc => existingZeplinId?.includes(sc.name))
        ));

    if ((componentNameExists || componentIdExists) &&
        !(await confirmAddExistingComponent(ctx, task))) {
        throw new TaskError(ui.existingComponent);
    }

    config.components = [
        ...existingComponents,
        {
            path: ctx.file.path,
            zeplinIds: ctx.selectedComponents.map(c => c._id)
        }
    ];

    await writeJsonIntoFile(ctx.cliOptions.configFile, config);
};

export const addComponentConfig = new Task<AddComponentContext>({
    steps: [
        addComponent,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});