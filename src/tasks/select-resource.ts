import inquirer from "inquirer";
import inquirerSearchList from "inquirer-search-list";
import { Task, TaskStep, pauseSpinningAndExecuteTask, transitionTo } from "../util/task";
import { ZeplinResource, ResourceContext } from "./context/resource";
import * as ui from "./ui/select-resource";
import { ZeplinApi } from "../api";
import logger from "../util/logger";
import { CLIError } from "../errors";
import { WorkaroundChoice } from "../util/inquirer-helpers";

inquirer.registerPrompt("search-list", inquirerSearchList);

const zeplinApi = new ZeplinApi();

function createChoice(resource: ZeplinResource): { name: string; value: WorkaroundChoice<ZeplinResource> } {
    const name = resource.organization
        ? `${resource.organization.name}'s Workspace/${resource.name}`
        : `Personal Workspace/${resource.name}`;
    const choice = new WorkaroundChoice(name, resource);

    return {
        name,
        value: choice
    };
}

const validateAuthencation: TaskStep<ResourceContext> = (ctx): void => {
    ctx.authService.validateToken({ requiredScopes: ["read"] });
};

const retrieveResources: TaskStep<ResourceContext> = async (ctx): Promise<void> => {
    const resources: Record<string, ZeplinResource> = {};
    try {
        const { projects } = await zeplinApi.getProjects(ctx.auth.token);
        projects.forEach(p => {
            resources[p._id] = {
                _id: p._id,
                name: p.name,
                type: "Project",
                organization: p.organization
            };
        });

        const { styleguides } = await zeplinApi.getStyleguides(ctx.auth.token);
        styleguides.forEach(s => {
            resources[s._id] = {
                _id: s._id,
                name: s.name,
                type: "Styleguide",
                organization: s.organization
            };
        });

        ctx.resources = resources;
    } catch (e) {
        logger.debug(e);
        throw new CLIError("Could not get Zeplin resources.", e);
    }
};

const checkResourceFlags: TaskStep<ResourceContext> = (ctx, task): void => {
    const resourceId = ctx.cliOptions.projectId || ctx.cliOptions.styleguideId;
    if (resourceId) {
        const foundResource = Object.values(ctx.resources).find(b => b._id === resourceId);

        if (foundResource) {
            ctx.selectedResource = foundResource;
            task.complete(ctx, ui.skippedSelection);
        } else {
            task.fail(ctx, ui.noMatchingResource);
            throw new Error(task.getCurrentText());
        }
    }
};

const select: TaskStep<ResourceContext> = async (ctx): Promise<void> => {
    const choices = Object.values(ctx.resources).map(b => createChoice(b));
    const { selection } = await inquirer.prompt([{
        type: "search-list",
        name: "selection",
        pageSize: 5,
        choices,
        message: "Which Zeplin project/styleguide would you like to setup?"
    }]);

    ctx.selectedResource = ctx.resources[selection.value.id];
};

export const selectResource = new Task<ResourceContext>({
    steps: [
        validateAuthencation,
        transitionTo(ui.retrieving),
        retrieveResources,
        checkResourceFlags,
        transitionTo(ui.select),
        pauseSpinningAndExecuteTask(select),
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
