import inquirer from "inquirer";
import { writeJsonIntoFile } from "../util/file";
import { Task, TaskStep, transitionTo } from "../util/task";
import { TaskError } from "../util/task/error";
import { AddComponentContext } from "./context/add-component";
import * as ui from "./ui/add-component-config";
import { existingComponentPrompt } from "../messages";
import logger from "../util/logger";
import { stringify } from "../util/text";

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
    const {
        configFile: config,
        selectedResource: resource,
        selectedComponents
    } = ctx;

    logger.debug(`Add component config context: ${stringify({
        config, resource, selectedComponents
    })}`);

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
            selectedComponents.find(sc => existingZeplinName?.includes(sc.name))
        ));

    const componentIdExists = !!(existingComponents.map(ec => ec.zeplinIds)
        .find(existingZeplinId =>
            selectedComponents.find(sc => existingZeplinId?.includes(sc._id))
        ));

    const componentWithSameFile = existingComponents.find(ec => ec.path === ctx.file.path);

    if ((componentNameExists || componentIdExists) &&
        !(await confirmAddExistingComponent(ctx, task))) {
        throw new TaskError(ui.existingComponent);
    }

    const selectedComponentIds = selectedComponents.map(c => c._id);

    if (componentWithSameFile) {
        const existingZeplinIds = componentWithSameFile.zeplinIds || [];

        componentWithSameFile.zeplinIds = Array.from(new Set<string>([
            ...existingZeplinIds,
            ...selectedComponentIds
        ]));
        logger.debug(`Added new component ID into existing component entry ${stringify(componentWithSameFile)}`);
    } else {
        const newComponent = {
            path: ctx.file.path,
            zeplinIds: selectedComponentIds
        };
        config.components = [
            ...existingComponents,
            newComponent
        ];
        logger.debug(`Added new component entry ${stringify(newComponent)}`);
    }

    logger.debug(`Updated config: ${stringify({ config })}`);

    await writeJsonIntoFile(ctx.cliOptions.configFile, config);
};

export const addComponentConfig = new Task<AddComponentContext>({
    steps: [
        addComponent,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});