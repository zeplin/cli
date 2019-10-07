import Axios, { AxiosInstance } from "axios";
import { defaults } from "../config/defaults";
import { LoginRequest, LoginResponse } from "./interfaces";
import { APIError, CLIError } from "../errors";
import { ProcessedComponentList } from "../commands/link/interfaces";

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

    async updateProcessedComponents(barrelId: string, request: ProcessedComponentList): Promise<void> {
        try {
            await this.axios.put(`/cli/componentcode/${barrelId}`, request);
        } catch (error) {
            if (error.isAxiosError) {
                throw new APIError(error.response);
            }
            throw new CLIError(error.message);
        }
    }
}
