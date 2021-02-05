import inquirer from "inquirer";
import inquirerSearchCheckbox from "inquirer-search-checkbox";
import { ResourceContext, ZeplinComponent } from "./context/resource";
import { TaskStep, Task, transitionTo, pauseSpinningAndExecuteTask } from "../util/task";
import { ComponentSection, Component } from "../api/interfaces";
import { ZeplinApi } from "../api";
import * as ui from "./ui/select-component";
import { TaskError } from "../util/task/error";
import { sortByField } from "../util/array";
import { selectComponentPrompt, chooseAtLeastOneComponentErrorMessage } from "../messages";
import logger from "../util/logger";
import { stringify } from "../util/text";

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

async function getStyleguideComponents(
    authToken: string,
    styleguideId: string,
    params?: {
        linkedProjectId?: string;
    }): Promise<ZeplinComponent[]> {
    const styleguide = await zeplinApi.getStyleguide(authToken, styleguideId, params);
    const components = extractComponents(styleguide.componentSections);

    if (styleguide.ancestors && styleguide.ancestors.length > 0) {
        const linkedResource = params || { linkedStyleguideId: styleguideId };
        const linkedStyleguides = await Promise.all(
            styleguide.ancestors.map(linkedStid =>
                zeplinApi.getStyleguide(authToken, linkedStid, linkedResource)
            )
        );
        linkedStyleguides.forEach(s => components.push(...extractComponents(s.componentSections)));
    }

    return components;
}

async function getProjectComponents(authToken: string, projectId: string): Promise<ZeplinComponent[]> {
    const project = await zeplinApi.getProject(authToken, projectId);
    const projectComponents = extractComponents(project.componentSections);

    if (project.styleguide) {
        const linkedStyleguideComponents = await getStyleguideComponents(
            authToken,
            project.styleguide,
            { linkedProjectId: projectId }
        );
        linkedStyleguideComponents.forEach(linkedComponent => projectComponents.push(linkedComponent));
    }

    return projectComponents;
}

const validateAuthencation: TaskStep<ResourceContext> = (ctx): void => {
    ctx.authService.validateToken({ requiredScopes: ["read"] });
};

const retrieveComponents: TaskStep<ResourceContext> = async (ctx): Promise<void> => {
    const { selectedResource } = ctx;

    if (selectedResource.type === "Project") {
        ctx.components = await getProjectComponents(ctx.auth.token, selectedResource._id);
    } else {
        ctx.components = await getStyleguideComponents(ctx.auth.token, selectedResource._id);
    }

    if (!ctx.components || ctx.components.length === 0) {
        throw new TaskError(ui.foundNoComponents);
    }
};

const checkComponentFlag: TaskStep<ResourceContext> = (ctx, task): void => {
    if (ctx.cliOptions.componentId) {
        const foundComponent = Object.values(ctx.components).find(b => b._id === ctx.cliOptions.componentId);

        if (foundComponent) {
            logger.debug(`Found component via params: ${stringify(foundComponent)}`);
            ctx.selectedComponents = [foundComponent];
            task.complete(ctx, ui.skippedSelection);
        } else {
            throw new TaskError(ui.noMatchingComponent);
        }
    }
};

const select: TaskStep<ResourceContext> = async (ctx): Promise<void> => {
    const choices = sortByField(ctx.components.map(c => ({ name: c.name, value: c })), "name");

    const { selectedComponents } = await inquirer.prompt([{
        type: "search-checkbox",
        name: "selectedComponents",
        pageSize: 5,
        choices,
        message: selectComponentPrompt,
        validate: (answer): boolean | string => {
            if (answer.length < 1) {
                return chooseAtLeastOneComponentErrorMessage;
            }
            return true;
        }
    }]);

    ctx.selectedComponents = selectedComponents;
};

export const selectComponent = new Task<ResourceContext>({
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