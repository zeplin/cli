import Axios, { AxiosInstance } from "axios";
import { defaults } from "../config/defaults";
import { LoginRequest, LoginResponse } from "./interfaces";
import { APIError, CLIError } from "../errors";
import { LinkedComponentList } from "../commands/link/interfaces";

const LOGIN_URL = "/users/login";

export class ZeplinApi {
    axios: AxiosInstance = Axios.create(defaults.api);

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

    async uploadLinkedComponents(
        params: { barrelId: string; type: string },
        body: LinkedComponentList
    ): Promise<void> {
        try {
            const { barrelId, type } = params;

            await this.axios.put(`/public/${type}/${barrelId}/componentcode`, body);
        } catch (error) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }
}
