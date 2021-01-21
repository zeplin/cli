import { Task, transitionTo, TaskStep } from "../util/task";
import * as ui from "./ui/generate-config";
import { InitializeContext } from "./context/initialize";
import { mkdir, writeJsonIntoFile } from "../util/file";
import path from "path";
import { ComponentConfigFile } from "../commands/connect/interfaces/config";
import logger from "../util/logger";
import { stringify } from "../util/text";

const writeFile = async (filePath: string, config: ComponentConfigFile): Promise<void> => {
    await mkdir(path.dirname(filePath));
    await writeJsonIntoFile(filePath, config);
};

const generate: TaskStep<InitializeContext> = async ctx => {
    const config: ComponentConfigFile = Object.create(null);
    const resource = ctx.selectedResource;

    config.plugins = await Promise.all(
        ctx.installedPlugins.map(async name => {
            const projectType = ctx.projectTypes.find(pt =>
                pt.installPackages && pt.installPackages.includes(name)
            );

            if (projectType?.configurator) {
                const pluginConfig = await projectType.configurator(ctx.packageJson);
                return { name, config: pluginConfig };
            }

            return { name };
        })
    );

    if (resource.type === "Project") {
        config.projects = [resource._id];
    } else {
        config.styleguides = [resource._id];
    }

    config.components = [{
        path: ctx.file.path,
        zeplinIds: ctx.selectedComponents.map(c => c._id)
    }];

    if (ctx.git) {
        config[ctx.git.type] = ctx.git.config;
    }

    logger.debug(`Generated config file: ${stringify(config)}`);
    await writeFile(ctx.cliOptions.configFile, config);
};

export const generateConfig = new Task<InitializeContext>({
    steps: [
        generate,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});