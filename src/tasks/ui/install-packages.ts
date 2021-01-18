import { TaskUI } from "../../util/task/types";
import { InstallPackagesContext } from "../context/install-packages";

export const initial = (): TaskUI => ({
    text: "Installing packages..."
});

export const skippedInstallation = (ctx: InstallPackagesContext): TaskUI => ({
    text: `Skipped installing Zeplin CLI packages`,
    subtext: ctx.cliOptions.skipLocalInstall ? "Dependencies added into package.json" : undefined
});

export const installingPlugins = (): TaskUI => ({
    text: "Installing plugins..."
});

export const completed = (ctx: InstallPackagesContext): TaskUI => ({
    text: `Installed packages`,
    subtext: Object.keys(ctx.installedPackages).map(
        packageName => `${packageName}@${ctx.installedPackages[packageName]}`
    ).join("\n")
});
