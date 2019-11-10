import { ZeplinApi } from "../../api";
import { AuthenticationService } from "../../service/auth";
import { LinkedBarrelComponents } from "./interfaces";
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

    async uploadLinkedBarrels(linkedBarrelComponents: LinkedBarrelComponents[]): Promise<void> {
        try {
            const authToken = await this.authService.authenticate();

            await this.upload(authToken, linkedBarrelComponents);
        } catch (error) {
            if (APIError.isAPIError(error)) {
                if (error.status === UNAUTHORIZED && !isCI()) {
                    console.log("Authentication token is invalid.");
                    const authToken = await this.authService.promptForLogin();

                    await this.upload(authToken, linkedBarrelComponents);
                }
            }
            throw error;
        }
    }

    private async upload(
        authToken: string,
        linkedBarrelComponents: LinkedBarrelComponents[]
    ): Promise<void> {
        await Promise.all(linkedBarrelComponents.map(async linkedBarrelComponent => {
            // TODO upload progress on console
            if (linkedBarrelComponent.projects) {
                await Promise.all(linkedBarrelComponent.projects.map(async pid => {
                    await this.zeplinApi.uploadLinkedComponents(
                        authToken,
                        { barrelId: pid, barrelType: "projects" },
                        { connectedComponents: linkedBarrelComponent.connectedComponents }
                    );
                }));
            }

            if (linkedBarrelComponent.styleguides) {
                await Promise.all(linkedBarrelComponent.styleguides.map(async stid => {
                    await this.zeplinApi.uploadLinkedComponents(
                        authToken,
                        { barrelId: stid, barrelType: "styleguides" },
                        { connectedComponents: linkedBarrelComponent.connectedComponents }
                    );
                }));
            }
        }));
    }
}