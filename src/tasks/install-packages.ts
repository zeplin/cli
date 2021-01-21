import { TaskStep, Task, transitionTo } from "../util/task";
import * as ui from "./ui/install-packages";
import { InstallPackagesContext } from "./context/install-packages";
import { installPackages, getLatestVersions } from "../service/package-manager";
import { getPackageJson, writePackageJson, PackageJson } from "../util/js/config";
import { projectHasYarn } from "../util/package";
import { sortByKeys } from "../util/object";
import logger from "../util/logger";
import { stringify } from "../util/text";

const addZeplinScripts = (packageJson: PackageJson): void => {
    packageJson.scripts = {
        ...packageJson.scripts,
        "zeplin-connect": "zeplin connect",
        "zeplin-connect-dev-mode": "zeplin connect --dev"
    };
};

const install: TaskStep<InstallPackagesContext> = async (ctx, task): Promise<void> => {
    const projectTypes = ctx.projectTypes || [];

    const plugins = projectTypes.reduce((p, c) => p.concat(c.installPackages || []), [] as string[]);

    ctx.installedPlugins = plugins;

    const packageNames = [
        "@zeplin/cli",
        ...plugins
    ];

    const packageNamesWithVersions = await getLatestVersions(packageNames);

    ctx.installedPackages = packageNamesWithVersions;

    let packageJson = await getPackageJson();
    logger.debug(`Current package.json: ${stringify(packageJson)}`);

    const installGlobal = !packageJson;
    ctx.installGlobally = installGlobal;
    if (ctx.cliOptions.skipInstall) {
        if (packageJson) {
            packageJson.devDependencies = sortByKeys({
                ...packageJson.devDependencies,
                ...packageNamesWithVersions
            });
        }
        logger.debug("Skipped package installation");
        task.skip(ctx, ui.skippedInstallation);
    } else {
        logger.debug(`Installing packages ${stringify({ installGlobal, packageNamesWithVersions })}`);
        await installPackages(packageNamesWithVersions, { installGlobal });

        ctx.isYarn = projectHasYarn();

        if (packageJson) {
            packageJson = await getPackageJson();
        }
    }

    if (packageJson) {
        addZeplinScripts(packageJson);
        logger.debug(`Updating package.json: ${stringify({ packageJson })}`);
        await writePackageJson(packageJson);
    }
};

export const installPackage = new Task<InstallPackagesContext>({
    steps: [
        install,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
