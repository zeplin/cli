import { AuthenticationContext } from "./authentication";
import { ConnectedComponentsService } from "../../commands/connect/service";
import { InstallPackagesContext } from "./install-packages";

export type ConnectContext = AuthenticationContext
    & InstallPackagesContext
    & {
        cliOptions: {
            skipConnect: boolean;
            output: string;
        };
        connectService: ConnectedComponentsService;
        skippedInstallingRequiredPackages: boolean;
        skippedConnect: boolean;
    };
