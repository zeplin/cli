import inquirer from "inquirer";
import { mocked } from "ts-jest/utils";
import { readAuthToken, saveAuthToken } from "../src/util/auth-file";
import { AuthenticationService } from "../src/service/auth";
import { AuthError } from "../src/errors";
import * as envUtil from "../src/util/env";
import * as samples from "./samples";
import dedent from "ts-dedent";

jest.mock("inquirer");
jest.mock("../src/api");
jest.mock("../src/util/env");
jest.mock("../src/util/auth-file");

describe("AuthenticationService", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("authenticate()", () => {
        describe("Token is retrieved from login flow.", () => {
            it("returns JWT when login flow is successful.", async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.isCI).mockReturnValueOnce(false);
                mocked(readAuthToken).mockResolvedValueOnce("");
                mocked(inquirer.prompt).mockResolvedValueOnce(samples.loginRequest);
                mocked(authenticationService.zeplinApi.login).mockResolvedValueOnce(samples.loginResponse);
                mocked(authenticationService.zeplinApi.generateToken).mockResolvedValueOnce(samples.validJwt);

                await expect(authenticationService.authenticate())
                    .resolves
                    .toBe(samples.validJwt);

                expect(readAuthToken).toHaveBeenCalled();
                expect(inquirer.prompt).toHaveBeenCalled();
                expect(authenticationService.zeplinApi.login).toHaveBeenCalledWith(samples.loginRequest);
                expect(authenticationService.zeplinApi.generateToken).toHaveBeenCalledWith(samples.loginResponse.token);
                expect(saveAuthToken).toHaveBeenCalledWith(samples.validJwt);
            });

            it("throws error when login API throws error.", async () => {
                const authenticationService = new AuthenticationService();

                const apiError = new Error("When beggars die there are no comets seen.");

                mocked(envUtil.isCI).mockReturnValueOnce(false);
                mocked(readAuthToken).mockResolvedValueOnce("");
                mocked(inquirer.prompt).mockResolvedValueOnce(samples.loginRequest);
                mocked(authenticationService.zeplinApi.login).mockRejectedValueOnce(apiError);
                mocked(authenticationService.zeplinApi.generateToken).mockResolvedValueOnce(samples.validJwt);

                await expect(authenticationService.authenticate())
                    .rejects
                    .toThrow(apiError);

                expect(readAuthToken).toHaveBeenCalled();
                expect(inquirer.prompt).toHaveBeenCalled();
                expect(authenticationService.zeplinApi.generateToken).not.toHaveBeenCalled();
                expect(saveAuthToken).not.toHaveBeenCalled();
            });

            it("throws error when generateToken API throws error.", async () => {
                const authenticationService = new AuthenticationService();

                const apiError = new Error("The heavens themselves blaze forth the death of princes.");

                mocked(envUtil.isCI).mockReturnValueOnce(false);
                mocked(readAuthToken).mockResolvedValueOnce("");
                mocked(inquirer.prompt).mockResolvedValueOnce(samples.loginRequest);
                mocked(authenticationService.zeplinApi.login).mockResolvedValueOnce(samples.loginResponse);
                mocked(authenticationService.zeplinApi.generateToken).mockRejectedValueOnce(apiError);

                await expect(authenticationService.authenticate())
                    .rejects
                    .toThrow(apiError);

                expect(readAuthToken).toHaveBeenCalled();
                expect(inquirer.prompt).toHaveBeenCalled();
                expect(authenticationService.zeplinApi.login).toHaveBeenCalledWith(samples.loginRequest);
                expect(saveAuthToken).not.toHaveBeenCalled();
            });
        });

        describe("Token is retrieved from env variables.", () => {
            it("returns JWT when token is valid", async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.getAccessTokenFromEnv).mockReturnValueOnce(samples.validJwt);

                await expect(authenticationService.authenticate())
                    .resolves
                    .toBe(samples.validJwt);

                expect(readAuthToken).not.toHaveBeenCalled();
                expect(inquirer.prompt).not.toHaveBeenCalled();
                expect(authenticationService.zeplinApi.login).not.toHaveBeenCalled();
                expect(authenticationService.zeplinApi.generateToken).not.toHaveBeenCalled();
                expect(saveAuthToken).not.toHaveBeenCalled();
            });

            it("returns JWT when token has the required scopes", async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.getAccessTokenFromEnv).mockReturnValueOnce(samples.validJwt);

                await expect(authenticationService.authenticate({ requiredScopes: ["write", "delete"] }))
                    .resolves
                    .toBe(samples.validJwt);

                expect(readAuthToken).not.toHaveBeenCalled();
                expect(inquirer.prompt).not.toHaveBeenCalled();
                expect(authenticationService.zeplinApi.login).not.toHaveBeenCalled();
                expect(authenticationService.zeplinApi.generateToken).not.toHaveBeenCalled();
                expect(saveAuthToken).not.toHaveBeenCalled();
            });

            it("throws 'Invalid authentication token.' when token is invalid.", async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.getAccessTokenFromEnv).mockReturnValueOnce(samples.invalidJwt);

                await expect(authenticationService.authenticate())
                    .rejects
                    .toThrowError(new AuthError("Invalid authentication token."));
            });

            it("throws 'Audience is not set in authentication token.' when token has no audience.", async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.getAccessTokenFromEnv).mockReturnValueOnce(samples.validJwtWithoutAudience);

                await expect(authenticationService.authenticate())
                    .rejects
                    .toThrowError(new AuthError("Audience is not set in authentication token."));
            });

            it(dedent`throws 'Access token has missing privileges, please login again to re-create access token.' 
            when token does not have the required delete scope`, async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.getAccessTokenFromEnv).mockReturnValueOnce(samples.validJwtWithoutDeleteScope);

                await expect(authenticationService.authenticate({ requiredScopes: ["delete"] }))
                    .rejects
                    .toThrowError(new AuthError("Access token has missing privileges, please login again to re-create access token."));
            });
        });

        describe("Token is retrieved from auth file.", () => {
            it("returns JWT when auth file has valid JWT.", async () => {
                const authenticationService = new AuthenticationService();

                mocked(readAuthToken).mockResolvedValueOnce(samples.validJwt);

                await expect(authenticationService.authenticate())
                    .resolves
                    .toBe(samples.validJwt);

                expect(readAuthToken).toHaveBeenCalled();
                expect(inquirer.prompt).not.toHaveBeenCalled();
                expect(authenticationService.zeplinApi.login).not.toHaveBeenCalled();
                expect(authenticationService.zeplinApi.generateToken).not.toHaveBeenCalled();
                expect(saveAuthToken).not.toHaveBeenCalled();
            });

            it("throws 'Invalid authentication token.' when token is invalid.", async () => {
                const authenticationService = new AuthenticationService();

                mocked(readAuthToken).mockResolvedValueOnce(samples.invalidJwt);

                await expect(authenticationService.authenticate())
                    .rejects
                    .toThrowError(new AuthError("Invalid authentication token."));
            });

            it("throws 'Audience is not set in authentication token.' when token has no audience.", async () => {
                const authenticationService = new AuthenticationService();

                mocked(readAuthToken).mockResolvedValueOnce(samples.validJwtWithoutAudience);

                await expect(authenticationService.authenticate())
                    .rejects
                    .toThrowError(new AuthError("Audience is not set in authentication token."));
            });
        });

        describe("On CI environment", () => {
            it("doesn't read auth file or prompt if no token is found on environment.", async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.isCI).mockReturnValueOnce(true);

                await expect(authenticationService.authenticate())
                    .rejects
                    .toThrowError(new AuthError("No authentication token is found."));

                expect(readAuthToken).not.toHaveBeenCalled();
                expect(inquirer.prompt).not.toHaveBeenCalled();
            });
        });
    });

    describe("promptForLogin()", () => {
        it("doesn't throw error when couldn't save token by default", async () => {
            const authenticationService = new AuthenticationService();

            const error = new Error("We are arrant knaves, all. Believe none of us.");

            mocked(saveAuthToken).mockRejectedValueOnce(error);
            mocked(inquirer.prompt).mockResolvedValueOnce(samples.loginRequest);
            mocked(authenticationService.zeplinApi.login).mockResolvedValueOnce(samples.loginResponse);
            mocked(authenticationService.zeplinApi.generateToken).mockResolvedValueOnce(samples.validJwt);

            await expect(authenticationService.promptForLogin())
                .resolves
                .toBe(samples.validJwt);
        });

        it("throws error when couldn't save token if ignoreSaveTokenErrors is false", async () => {
            const authenticationService = new AuthenticationService();

            const error = new Error("We are arrant knaves, all. Believe none of us.");

            mocked(saveAuthToken).mockRejectedValueOnce(error);
            mocked(inquirer.prompt).mockResolvedValueOnce(samples.loginRequest);
            mocked(authenticationService.zeplinApi.login).mockResolvedValueOnce(samples.loginResponse);
            mocked(authenticationService.zeplinApi.generateToken).mockResolvedValueOnce(samples.validJwt);

            await expect(authenticationService.promptForLogin({ ignoreSaveTokenErrors: false }))
                .rejects
                .toThrowError(error);
        });
    });
});