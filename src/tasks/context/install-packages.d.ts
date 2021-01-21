import { SupportedProjectType } from "../../service/project-type/project-types";
import { PackageJson } from "../../util/js/config";

export interface InstallPackagesContext {
    cliOptions: {
        skipInstall: boolean;
    };
    projectTypes: SupportedProjectType[];
    installedPackages: Record<string, string>;
    installedPlugins: string[];
    installGlobally: boolean;
    isYarn: boolean;
    packageJson: PackageJson | null;
}
