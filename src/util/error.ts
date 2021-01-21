import { APIError, AuthError } from "../errors";

export function isAuthenticationError(err: Error): boolean {
    return APIError.isUnauthorized(err) || AuthError.isAuthError(err);
}
