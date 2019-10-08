import { AxiosResponse } from "axios";

export class APIError extends Error {
    constructor(response: AxiosResponse) {
        let message = `API Error: ${response.status}: ${response.statusText}`;

        if (response.data) {
            message = `${response.data.title}: ${response.data.message}`;
        }

        super(message);
    }
}
