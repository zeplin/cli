import { TaskStep, Task, transitionTo } from "../util/task";
import * as ui from "./ui/detect-environment";
import { getPackageJson } from "../util/js/config";
import { getComponentConfigFiles } from "../commands/connect/config";
import { ConnectContext } from "./context/connect";
import logger from "../util/logger";
import { stringify } from "../util/text";

const detect: TaskStep<ConnectContext> = async (ctx): Promise<void> => {
    const packageJson = await getPackageJson();

    const installedGlobally = !packageJson;
    const [configFile] = await getComponentConfigFiles([ctx.cliOptions.configFile]);

    const installedPlugins = (configFile.plugins || []).map(p => p.name);

    logger.debug(`Environment: ${stringify({
        installedPlugins,
        installedGlobally
    })}`);

    ctx.installedPlugins = installedPlugins;
    ctx.installGlobally = installedGlobally;
    ctx.packageJson = packageJson;
};

export const detectEnvironment = new Task<ConnectContext>({
    steps: [
        detect,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
