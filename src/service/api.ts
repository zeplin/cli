import { ZeplinApi } from "../api";

export class ApiService {
    zeplinApi: ZeplinApi;

    constructor() {
        this.zeplinApi = new ZeplinApi();
    }
}