import {
    AuthenticationContext,
    DetectGitContext,
    FileContext,
    ProjectTypeContext,
    ResourceContext,
    InstallPackagesContext,
    ConnectContext
} from ".";

export interface CliOptions {
    projectId?: string;
    styleguideId?: string;
    componentId?: string;
    componentFilename?: string;
    type?: string[];
    configFile: string;
    skipConnect?: boolean;
    skipLocalInstall?: boolean;
}

export type InitializeContext = AuthenticationContext &
    DetectGitContext &
    ResourceContext &
    ProjectTypeContext &
    FileContext &
    InstallPackagesContext &
    ConnectContext & {
        cliOptions: CliOptions;
    };