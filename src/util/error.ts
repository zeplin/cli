import { APIError, AuthError } from "../errors";

export function isAuthenticationError(err: Error): err is APIError | AuthError {
    return APIError.isUnauthorized(err) || AuthError.isAuthError(err);
}
