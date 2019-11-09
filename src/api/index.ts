import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { defaults } from "../config/defaults";
import { LoginRequest, LoginResponse } from "./interfaces";
import { APIError, CLIError } from "../errors";
import { LinkedComponentList } from "../commands/link/interfaces";

const LOGIN_URL = "/users/login";
const AUTHORIZE_URL = "/oauth/authorize";

type BarrelType = "projects" | "styleguides";

export class ZeplinApi {
    axios: AxiosInstance = Axios.create({ baseURL: defaults.api.baseURL });

    constructor(config?: AxiosRequestConfig) {
        if (config) {
            Object.assign(this.axios.defaults, config);
        }
    }

    async login(request: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await this.axios.post(LOGIN_URL, {
                handle: request.handle,
                password: request.password
            });
            return response.data;
        } catch (error) {
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
                    scope: "write"
                },
                headers: { "Zeplin-Token": zeplinToken },
                maxRedirects: 0
            });

            const responseParams = new URLSearchParams(response.data.split("?"));

            return responseParams.get("access_token") as string;
        } catch (error) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }

    async uploadLinkedComponents(
        authToken: string,
        params: { barrelId: string; barrelType: BarrelType },
        body: LinkedComponentList
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
        } catch (error) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }
}