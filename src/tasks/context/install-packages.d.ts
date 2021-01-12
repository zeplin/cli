import { SupportedProjectType } from "../../service/project-type/project-types";

export interface InstallPackagesContext {
    cliOptions: {
        skipInstall: boolean;
    };
    projectTypes: SupportedProjectType[];
    installedPackages: Record<string, string>;
    installedPlugins: string[];
    installedGlobally: boolean;
    skippedInstallingRequiredPackages: boolean;
    isYarn: boolean;
}
