import chalk from "chalk";
import dedent from "ts-dedent";
import { isCI } from "../../util/env";
import { ZeplinApi } from "../../api";
import { AuthenticationService } from "../../service/auth";
import { ConnectedBarrelComponents, ConnectedBarrels } from "./interfaces/api";
import logger from "../../util/logger";
import { isAuthenticationError } from "../../util/error";

export class ConnectedComponentsService {
    zeplinApi: ZeplinApi;
    authService: AuthenticationService;

    constructor({
        zeplinApi,
        authService
    }: {
        zeplinApi?: ZeplinApi;
        authService?: AuthenticationService;
    } = {}) {
        this.zeplinApi = zeplinApi || new ZeplinApi();
        this.authService = authService || new AuthenticationService();
    }

    async uploadConnectedBarrels(
        connectedBarrelComponents: ConnectedBarrelComponents[],
        options: { force: boolean }
    ): Promise<void> {
        const requiredScopes = ["write"];
        try {
            const { token } = await this.authService.authenticate({ requiredScopes });

            await this.upload(token, connectedBarrelComponents, options);
        } catch (error) {
            if (isAuthenticationError(error)) {
                if (isCI()) {
                    error.message = dedent`
                    ${error.message}
                    Please update ${chalk.dim`ZEPLIN_ACCESS_TOKEN`} environment variable.`;
                } else {
                    logger.info(error.message);
                    const { token } = await this.authService.promptForLogin({ requiredScopes, forceRenewal: true });

                    await this.upload(token, connectedBarrelComponents, options);
                    return;
                }
            }
            throw error;
        }
    }

    async deleteConnectedBarrels(connectedComponents: ConnectedBarrels[]): Promise<void> {
        const requiredScopes = ["delete"];
        try {
            const { token } = await this.authService.authenticate({ requiredScopes });

            await this.delete(token, connectedComponents);
        } catch (error) {
            if (isAuthenticationError(error)) {
                if (isCI()) {
                    error.message = dedent`
                    ${error.message}
                    Please update ${chalk.dim`ZEPLIN_ACCESS_TOKEN`} environment variable.`;
                } else {
                    logger.info(error.message);
                    const { token } = await this.authService.promptForLogin({ requiredScopes, forceRenewal: true });

                    await this.delete(token, connectedComponents);
                    return;
                }
            }
            throw error;
        }
    }

    private async upload(
        authToken: string,
        connectedBarrelComponents: ConnectedBarrelComponents[],
        { force }: { force: boolean }
    ): Promise<void> {
        await Promise.all(connectedBarrelComponents.map(async connectedBarrelComponent => {
            // TODO upload progress on console
            await Promise.all(connectedBarrelComponent.projects.map(async pid => {
                await this.zeplinApi.uploadConnectedComponents(
                    authToken,
                    { barrelId: pid, barrelType: "projects" },
                    { items: connectedBarrelComponent.items },
                    { forceOverwrite: force }
                );
            }));

            await Promise.all(connectedBarrelComponent.styleguides.map(async stid => {
                await this.zeplinApi.uploadConnectedComponents(
                    authToken,
                    { barrelId: stid, barrelType: "styleguides" },
                    { items: connectedBarrelComponent.items },
                    { forceOverwrite: force }
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
