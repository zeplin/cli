import { AuthenticationContext } from "./authentication";
import { ConnectedComponentsService } from "../../commands/connect/service";
import { InstallPackagesContext } from "./install-packages";

export type ConnectContext = AuthenticationContext
    & InstallPackagesContext
    & {
        cliOptions: {
            skipConnect: boolean;
            configFile: string;
            force: boolean;
        };
        connectService: ConnectedComponentsService;
        skippedConnect: boolean;
    };
