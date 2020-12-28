import chalk from "chalk";
import dedent from "ts-dedent";
import { isCI } from "../../util/env";
import { ZeplinApi } from "../../api";
import { AuthenticationService } from "../../service/auth";
import { ConnectedBarrelComponents, ConnectedBarrels } from "./interfaces/api";
import { APIError, AuthError } from "../../errors";
import logger from "../../util/logger";

const isAuthenticationError = (err: Error): boolean => (APIError.isUnauthorized(err) || AuthError.isAuthError(err));

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
            const { token } = await this.authService.authenticate();

            await this.upload(token, connectedBarrelComponents);
        } catch (error) {
            if (isAuthenticationError(error)) {
                if (isCI()) {
                    error.message = dedent`
                    ${error.message}
                    Please update ${chalk.dim`ZEPLIN_ACCESS_TOKEN`} environment variable.`;
                } else {
                    logger.info(error.message);
                    const { token } = await this.authService.promptForLogin();

                    await this.upload(token, connectedBarrelComponents);
                    return;
                }
            }
            throw error;
        }
    }

    async deleteConnectedBarrels(connectedComponents: ConnectedBarrels[]): Promise<void> {
        try {
            const { token } = await this.authService.authenticate({ requiredScopes: ["delete"] });

            await this.delete(token, connectedComponents);
        } catch (error) {
            if (isAuthenticationError(error)) {
                if (isCI()) {
                    error.message = dedent`
                    ${error.message}
                    Please update ${chalk.dim`ZEPLIN_ACCESS_TOKEN`} environment variable.`;
                } else {
                    logger.info(error.message);
                    const { token } = await this.authService.promptForLogin();

                    await this.delete(token, connectedComponents);
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
            await Promise.all(connectedBarrelComponent.projects.map(async pid => {
                await this.zeplinApi.uploadConnectedComponents(
                    authToken,
                    { barrelId: pid, barrelType: "projects" },
                    { connectedComponents: connectedBarrelComponent.connectedComponents }
                );
            }));

            await Promise.all(connectedBarrelComponent.styleguides.map(async stid => {
                await this.zeplinApi.uploadConnectedComponents(
                    authToken,
                    { barrelId: stid, barrelType: "styleguides" },
                    { connectedComponents: connectedBarrelComponent.connectedComponents }
                );
            }));
        }));
    }

    private async delete(
        authToken: string,
        connectedComponents: ConnectedBarrels[]
    ): Promise<void> {
        await Promise.all(connectedComponents.map(async connectedBarrelComponent => {
            // TODO delete progress on console
            await Promise.all(connectedBarrelComponent.projects.map(async pid => {
                await this.zeplinApi.deleteConnectedComponents(
                    authToken,
                    { barrelId: pid, barrelType: "projects" }
                );
            }));

            await Promise.all(connectedBarrelComponent.styleguides.map(async stid => {
                await this.zeplinApi.deleteConnectedComponents(
                    authToken,
                    { barrelId: stid, barrelType: "styleguides" }
                );
            }));
        }));
    }
}