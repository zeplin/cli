import { Task, transitionTo, TaskStep } from "../util/task";
import * as ui from "./ui/generate-config";
import { InitializeContext } from "./context/initialize";
import { mkdir, writeJsonIntoFile } from "../util/file";
import path from "path";
import { ComponentConfigFile } from "../commands/connect/interfaces/config";

const writeFile = async (filePath: string, config: ComponentConfigFile): Promise<void> => {
    await mkdir(path.dirname(filePath));
    await writeJsonIntoFile(filePath, config);
};

const generate: TaskStep<InitializeContext> = async ctx => {
    const config: ComponentConfigFile = Object.create(null);
    const resource = ctx.selectedResource;

    config.plugins = ctx.installedPlugins.map(p => ({
        name: p
    }));

    if (resource.type === "Project") {
        config.projects = [resource._id];
    } else {
        config.styleguides = [resource._id];
    }

    config.components = [{
        path: ctx.file.path,
        zeplinNames: ctx.selectedComponents.map(c => c.name)
    }];

    if (ctx.git) {
        config[ctx.git.type] = ctx.git.config;
    }

    await writeFile(ctx.cliOptions.configFile, config);
};

export const generateConfig = new Task<InitializeContext>({
    steps: [
        generate,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});