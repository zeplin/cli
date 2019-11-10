import { AxiosResponse } from "axios";
import { UNAUTHORIZED } from "http-status-codes";

export class APIError extends Error {
    status: number;

    constructor(response: AxiosResponse) {
        let message;

        if (response.status === UNAUTHORIZED) {
            message = `API Error: ${response.status} - Authentication token is invalid.`;
        } else if (response.data) {
            message = `API Error: ${response.status} - ${response.data.title}: ${response.data.message}`;
        } else {
            message = `API Error: ${response.status} - ${response.statusText}`;
        }

        super(message);

        this.status = response.status;
    }

    static isAPIError(err: Error): err is APIError {
        return err instanceof APIError;
    }
}
