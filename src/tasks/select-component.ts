import inquirer from "inquirer";
import inquirerSearchCheckbox from "inquirer-search-checkbox";
import { ResourceContext, ZeplinComponent } from "./context/resource";
import { TaskStep, Task, transitionTo, pauseSpinningAndExecuteTask } from "../util/task";
import { ComponentSection, Component } from "../api/interfaces";
import { ZeplinApi } from "../api";
import * as ui from "./ui/select-component";

inquirer.registerPrompt("search-checkbox", inquirerSearchCheckbox);

const zeplinApi = new ZeplinApi();

function mapComponents(components: Component[] = []): ZeplinComponent[] {
    return components.map(c => ({
        _id: c._id,
        name: c.name,
        sourceId: c.sourceId
    }));
}

function extractComponents(componentSections: ComponentSection[] = []): ZeplinComponent[] {
    const components: ZeplinComponent[] = [];

    componentSections.forEach(cs => {
        components.push(...(mapComponents(cs.components)));
        components.push(...extractComponents(cs.componentSections));
    });

    return components;
}

const validateAuthencation: TaskStep<ResourceContext> = (ctx): void => {
    ctx.authService.validateToken({ requiredScopes: ["read"] });
};

const retrieveComponents: TaskStep<ResourceContext> = async (ctx): Promise<void> => {
    const { selectedResource } = ctx;
    if (selectedResource.type === "Project") {
        const project = await zeplinApi.getProject(ctx.auth.token, selectedResource._id);
        ctx.components = extractComponents(project.componentSections);
    } else {
        const styleguide = await zeplinApi.getStyleguide(ctx.auth.token, selectedResource._id);
        ctx.components = extractComponents(styleguide.componentSections);
    }
};

const checkComponentFlag: TaskStep<ResourceContext> = (ctx, task): void => {
    if (ctx.cliOptions.componentId) {
        const foundComponent = Object.values(ctx.components).find(b => b._id === ctx.cliOptions.componentId);

        if (foundComponent) {
            ctx.selectedComponents = [foundComponent];
            task.complete(ctx, ui.skippedSelection);
        } else {
            task.fail(ctx, ui.noMatchingComponent);
            throw new Error(task.getCurrentText());
        }
    }
};

const select: TaskStep<ResourceContext> = async (ctx): Promise<void> => {
    const { choices } = await inquirer.prompt([{
        type: "search-checkbox",
        name: "choices",
        pageSize: 5,
        choices: ctx.components.map(c => ({ name: c.name, value: c })),
        message: "Which components would you like to connect?",
        validate: (answer): boolean | string => {
            if (answer.length < 1) {
                return "You must choose at least one Zeplin component.";
            }
            return true;
        }
    }]);

    ctx.selectedComponents = choices;
};

export const selectComponent = new Task({
    steps: [
        validateAuthencation,
        transitionTo(ui.retrieving),
        retrieveComponents,
        checkComponentFlag,
        transitionTo(ui.select),
        pauseSpinningAndExecuteTask(select),
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});