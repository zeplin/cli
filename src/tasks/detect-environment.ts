import { TaskStep, Task, transitionTo } from "../util/task";
import * as ui from "./ui/detect-environment";
import { getPackageJson } from "../util/js/config";
import { getComponentConfigFiles } from "../commands/connect/config";
import { ConnectContext } from "./context/connect";

const detect: TaskStep<ConnectContext> = async (ctx): Promise<void> => {
    const packageJson = await getPackageJson();

    ctx.installedGlobally = !packageJson;
    const [configFile] = await getComponentConfigFiles([ctx.cliOptions.configFile]);

    ctx.installedPlugins = (configFile.plugins || []).map(p => p.name);
};

export const detectEnvironment = new Task<ConnectContext>({
    steps: [
        detect,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
