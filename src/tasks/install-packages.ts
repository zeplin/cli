import { TaskStep, Task, transitionTo } from "../util/task";
import * as ui from "./ui/install-packages";
import { InstallPackagesContext } from "./context/install-packages";
import { installPackages, getLatestVersions } from "../service/package-manager";
import { getPackageJson, writePackageJson, PackageJson } from "../util/js/config";

const addZeplinScripts = (packageJson: PackageJson): void => {
    packageJson.scripts = {
        ...packageJson.scripts,
        "zeplin-connect": "zeplin connect",
        "zeplin-connect-dev-mode": "zeplin connect --dev"
    };
};

const install: TaskStep<InstallPackagesContext> = async (ctx, task): Promise<void> => {
    const projectTypes = ctx.projectTypes || [];

    const packageNames = [
        "@zeplin/cli",
        ...(projectTypes).reduce((p, c) => p.concat(c.installPackages || []), [] as string[])
    ];

    const packageNamesWithVersions = await getLatestVersions(packageNames);

    ctx.installedPackages = packageNamesWithVersions;

    const packageJson = await getPackageJson();

    const installGlobal = !packageJson;

    if (ctx.cliOptions.skipInstall) {
        ctx.skippedRequiredPackages = projectTypes.length > 0;
        if (packageJson) {
            packageJson.devDependencies = {
                ...packageJson.devDependencies,
                ...packageNamesWithVersions
            };
        }
        task.skip(ctx, ui.skippedInstallation);
    } else {
        await installPackages(packageNamesWithVersions, { installGlobal });
        ctx.localInstalled = !installGlobal;
    }

    if (packageJson) {
        addZeplinScripts(packageJson);
        await writePackageJson(packageJson);
    }
};

export const installPackagesTask = new Task({
    steps: [
        install,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
