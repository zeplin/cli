import { ZeplinApi } from "../../api";
import { AuthenticationService } from "../../service/auth";
import { ConnectedBarrelComponents } from "./interfaces";
import { APIError } from "../../errors";
import { isCI } from "../../util/env";
import { UNAUTHORIZED } from "http-status-codes";

export class ConnectedComponentsService {
    zeplinApi: ZeplinApi;
    authService: AuthenticationService;
    authToken: string | undefined;

    constructor() {
        this.zeplinApi = new ZeplinApi();
        this.authService = new AuthenticationService();
    }

    async uploadConnectedBarrels(connectedBarrelComponents: ConnectedBarrelComponents[]): Promise<void> {
        try {
            const authToken = await this.authService.authenticate();

            await this.upload(authToken, connectedBarrelComponents);
        } catch (error) {
            if (APIError.isAPIError(error)) {
                if (error.status === UNAUTHORIZED && !isCI()) {
                    console.log("Authentication token is invalid.");
                    const authToken = await this.authService.promptForLogin();

                    await this.upload(authToken, connectedBarrelComponents);
                    return;
                }
            }
            throw error;
        }
    }

    private async upload(
        authToken: string,
        connectedBarrelComponents: ConnectedBarrelComponents[]
    ): Promise<void> {
        await Promise.all(connectedBarrelComponents.map(async connectedBarrelComponent => {
            // TODO upload progress on console
            if (connectedBarrelComponent.projects) {
                await Promise.all(connectedBarrelComponent.projects.map(async pid => {
                    await this.zeplinApi.uploadConnectedComponents(
                        authToken,
                        { barrelId: pid, barrelType: "projects" },
                        { connectedComponents: connectedBarrelComponent.connectedComponents }
                    );
                }));
            }

            if (connectedBarrelComponent.styleguides) {
                await Promise.all(connectedBarrelComponent.styleguides.map(async stid => {
                    await this.zeplinApi.uploadConnectedComponents(
                        authToken,
                        { barrelId: stid, barrelType: "styleguides" },
                        { connectedComponents: connectedBarrelComponent.connectedComponents }
                    );
                }));
            }
        }));
    }
}