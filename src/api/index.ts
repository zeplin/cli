import Axios, { AxiosInstance } from "axios";
import { defaults } from "../config/defaults";
import { LoginRequest, LoginResponse } from "./interfaces";
import { APIError, CLIError } from "../errors";
import { ConnectedComponentList } from "../commands/connect/interfaces";
import { MOVED_TEMPORARILY } from "http-status-codes";
import { URLSearchParams } from "url";

const LOGIN_URL = "/users/login";
const AUTHORIZE_URL = "/oauth/authorize";

type BarrelType = "projects" | "styleguides";

export class ZeplinApi {
    axios: AxiosInstance = Axios.create({ baseURL: defaults.api.baseURL });

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
                maxRedirects: 0,
                validateStatus: (status: number) => status === MOVED_TEMPORARILY
            });

            const [, responseQueryParams] = response.data.split("?");

            const responseParams = new URLSearchParams(responseQueryParams);

            return responseParams.get("access_token") as string;
        } catch (error) {
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
        } catch (error) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }
}