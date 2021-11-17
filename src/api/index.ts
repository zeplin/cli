import Axios, { AxiosInstance } from "axios";
import { defaults } from "../config/defaults";
import { interceptors } from "./interceptors";
import {
    LoginRequest,
    LoginResponse,
    ProjectsResponse,
    ProjectResponse,
    StyleguidesResponse,
    StyleguideResponse
} from "./interfaces";
import { APIError, CLIError } from "../errors";
import { ConnectedComponentList } from "../commands/connect/interfaces/api";
import { MOVED_TEMPORARILY } from "http-status-codes";
import { URLSearchParams } from "url";

const LOGIN_URL = "/users/login";
const AUTHORIZE_URL = "/oauth/authorize";
const REVOKE_URL = "/oauth/revoke";

export type BarrelType = "projects" | "styleguides";

export class ZeplinApi {
    axios: AxiosInstance;

    constructor() {
        this.axios = Axios.create({ baseURL: defaults.api.baseURL });

        interceptors.request.forEach(x => this.axios.interceptors.request.use(x));
        interceptors.response.forEach(x => this.axios.interceptors.response.use(x));
    }

    async login(request: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await this.axios.post(LOGIN_URL, {
                handle: request.handle,
                password: request.password
            });
            return response.data;
        } catch (error: any) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }

    async generateToken(zeplinToken: string): Promise<string> {
        try {
            const response = await this.axios.get(AUTHORIZE_URL, {
                params: {
                    client_id: defaults.api.clientId,
                    response_type: "token",
                    scope: "read write delete"
                },
                headers: { "Zeplin-Token": zeplinToken },
                maxRedirects: 0,
                validateStatus: (status: number): boolean => status === MOVED_TEMPORARILY
            });

            const [, responseQueryParams] = response.headers.location.split("?");

            const responseParams = new URLSearchParams(responseQueryParams);

            return responseParams.get("access_token") as string;
        } catch (error: any) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }

    async revokeToken(authToken: string): Promise<void> {
        try {
            await this.axios.post(REVOKE_URL, {}, {
                headers: { "Zeplin-Access-Token": authToken }
            });
        } catch (error: any) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }

    async uploadConnectedComponents(
        authToken: string,
        params: { barrelId: string; barrelType: BarrelType },
        body: ConnectedComponentList
    ): Promise<void> {
        try {
            const { barrelId, barrelType } = params;

            await this.axios.put(
                `/public/cli/${barrelType}/${barrelId}/connectedcomponents`,
                body,
                {
                    headers: { "Zeplin-Access-Token": authToken }
                }
            );
        } catch (error: any) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }

    async deleteConnectedComponents(
        authToken: string,
        params: { barrelId: string; barrelType: BarrelType }
    ): Promise<void> {
        try {
            const { barrelId, barrelType } = params;

            await this.axios.delete(
                `/public/cli/${barrelType}/${barrelId}/connectedcomponents`,
                {
                    headers: { "Zeplin-Access-Token": authToken }
                }
            );
        } catch (error: any) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }

    async getProjects(authToken: string): Promise<ProjectsResponse> {
        try {
            const response = await this.axios.get(
                `/public/cli/projects`,
                {
                    headers: { "Zeplin-Access-Token": authToken }
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }

    async getProject(authToken: string, projectId: string): Promise<ProjectResponse> {
        try {
            const response = await this.axios.get(
                `/public/cli/projects/${projectId}`,
                {
                    headers: { "Zeplin-Access-Token": authToken }
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }

    async getStyleguides(authToken: string): Promise<StyleguidesResponse> {
        try {
            const response = await this.axios.get(
                `/public/cli/styleguides`,
                {
                    headers: { "Zeplin-Access-Token": authToken }
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }

    async getStyleguide(
        authToken: string,
        styleguideId: string,
        params: {
            linkedProjectId?: string;
            linkedStyleguideId?: string;
        } = {}): Promise<StyleguideResponse> {
        try {
            const headers: Record<string, string> = { "Zeplin-Access-Token": authToken };
            if (params) {
                if (params.linkedProjectId) {
                    headers["zeplin-project-id"] = params.linkedProjectId;
                } else if (params.linkedStyleguideId) {
                    headers["zeplin-styleguide-id"] = params.linkedStyleguideId;
                }
            }

            const response = await this.axios.get(
                `/public/cli/styleguides/${styleguideId}`,
                { headers }
            );
            return response.data;
        } catch (error: any) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }
}
