import {
    AuthenticationContext,
    FileContext,
    ResourceContext,
    ConnectContext
} from ".";
import { CliOptions as InitializeCliOptions } from "./initialize";
import { ComponentConfigContext } from "./component-config";

export type CliOptions = Omit<InitializeCliOptions, "type" | "skipLocalInstall">;

export type AddComponentContext = ComponentConfigContext &
    AuthenticationContext &
    ResourceContext &
    FileContext &
    ConnectContext & {
        cliOptions: CliOptions;
    };