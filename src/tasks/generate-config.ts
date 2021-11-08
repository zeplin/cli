import { Task, transitionTo, TaskStep } from "../util/task";
import * as ui from "./ui/generate-config";
import { InitializeContext } from "./context/initialize";
import { mkdir, writeJsonIntoFile } from "../util/file";
import path from "path";
import { ComponentConfigFile, Plugin } from "../commands/connect/interfaces/config";
import logger from "../util/logger";
import { stringify } from "../util/text";
import { SupportedProjectType } from "../service/project-type/project-types";
import { PackageJson } from "../util/js/config";
import { isDefined } from "../util/object";

const writeFile = async (filePath: string, config: ComponentConfigFile): Promise<void> => {
    await mkdir(path.dirname(filePath));
    await writeJsonIntoFile(filePath, config);
};

const executeConfigurators = async (
    pluginName: string,
    projectTypes: SupportedProjectType[],
    packageJson: PackageJson | null
): Promise<Array<{}>> => {
    const pluginConfigs = await Promise.all(
        projectTypes.filter(pt =>
            pt.installPackages && pt.installPackages.includes(pluginName)
        ).map(async pt => {
            if (pt.configurator) {
                const pluginConfig = await pt.configurator(packageJson);
                return pluginConfig;
            }
            return null;
        })
    );
    return pluginConfigs.filter(isDefined);
};

const getPluginConfigs = (
    installedPlugins: string[],
    projectTypes: SupportedProjectType[],
    packageJson: PackageJson | null
): Promise<Plugin[]> => Promise.all(
    installedPlugins.map(async name => {
        const configs = await executeConfigurators(name, projectTypes, packageJson);

        if (configs.length > 0) {
            const pluginConfig = configs.reduce(
                (prev, curr) => Object.assign(prev, curr), {}
            );
            return {
                name,
                config: pluginConfig
            };
        }

        return { name };
    })
);

const generate: TaskStep<InitializeContext> = async ctx => {
    const {
        installedPlugins = [],
        projectTypes = [],
        packageJson,
        selectedResource,
        selectedComponents,
        file,
        git,
        cliOptions: {
            configFile
        }
    } = ctx;

    const config: ComponentConfigFile = Object.create(null);

    config.plugins = await getPluginConfigs(installedPlugins, projectTypes, packageJson);

    if (selectedResource.type === "Project") {
        config.projects = [selectedResource._id];
    } else {
        config.styleguides = [selectedResource._id];
    }

    config.components = [{
        path: file.path,
        zeplinIds: selectedComponents.map(c => c._id)
    }];

    if (git) {
        config[git.type] = git.config;
    }

    logger.debug(`Generated config file: ${stringify(config)}`);
    await writeFile(configFile, config);
};

export const generateConfig = new Task<InitializeContext>({
    steps: [
        generate,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
