import { Authentication, AuthenticationService } from "../../service/auth";

export interface AuthenticationContext {
    authService: AuthenticationService;
    auth: Authentication;
}
