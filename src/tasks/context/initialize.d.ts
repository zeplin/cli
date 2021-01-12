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
    filename?: string;
    type?: string[];
    output: string;
    skipConnect?: boolean;
    skipInstall?: boolean;
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