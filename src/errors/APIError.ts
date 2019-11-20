import { AxiosResponse } from "axios";
import { UNAUTHORIZED, BAD_REQUEST } from "http-status-codes";

export class APIError extends Error {
    status: number;
    details: { title: string; message: string };

    constructor(response: AxiosResponse) {
        let message;

        if (response.data) {
            switch (response.status) {
                case UNAUTHORIZED:
                    message = "Looks like your session has expired, please login again.";
                    break;
                case BAD_REQUEST:
                    message = "There is a problem with the request payload.";
                    break;
                default:
                    message = `${response.data.title} - ${response.data.message}`;
                    break;
            }
        } else {
            message = "Error occurred on API request. Please try again later.";
        }

        super(message);

        this.status = response.status;
        this.details = response.data;
    }

    static isAPIError(err: Error): err is APIError {
        return err instanceof APIError;
    }

    static isUnauthorized(err: Error): err is APIError {
        return this.isAPIError(err) && err.status === UNAUTHORIZED;
    }
}
