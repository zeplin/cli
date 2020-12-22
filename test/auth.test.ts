import { ChildProcess } from "child_process";
import inquirer from "inquirer";
import { mocked } from "ts-jest/utils";
import open from "open";
import { readAuthToken, saveAuthToken } from "../src/util/auth-file";
import { AuthenticationService } from "../src/service/auth";
import { AuthError } from "../src/errors";
import * as envUtil from "../src/util/env";
import * as samples from "./samples";
import dedent from "ts-dedent";
import PromptUI from "inquirer/lib/ui/prompt";

jest.mock("inquirer");
jest.mock("open");
jest.mock("../src/api");
jest.mock("../src/commands/login/server");
jest.mock("../src/util/env");
jest.mock("../src/util/auth-file");

describe("AuthenticationService", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("authenticate()", () => {
        describe("Token is retrieved from login flow.", () => {
            describe("Browser login is skipped.", () => {
                it("returns JWT when login flow is successful.", async () => {
                    const authenticationService = new AuthenticationService();

                    mocked(envUtil.isCI).mockReturnValueOnce(false);
                    mocked(readAuthToken).mockResolvedValueOnce("");
                    mocked(inquirer.prompt).mockResolvedValueOnce(samples.loginRequest);
                    mocked(authenticationService.zeplinApi.login).mockResolvedValueOnce(samples.loginResponse);
                    mocked(authenticationService.zeplinApi.generateToken).mockResolvedValueOnce(samples.validJwt);

                    await expect(authenticationService.authenticate({ requiredScopes: [], noBrowser: true }))
                        .resolves
                        .toBe(samples.validJwt);

                    expect(readAuthToken).toHaveBeenCalled();
                    expect(inquirer.prompt).toHaveBeenCalled();
                    expect(authenticationService.zeplinApi.login).toHaveBeenCalledWith(samples.loginRequest);
                    expect(authenticationService.zeplinApi.generateToken)
                        .toHaveBeenCalledWith(samples.loginResponse.token);
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

                    await expect(authenticationService.authenticate({ requiredScopes: [], noBrowser: true }))
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

                    await expect(authenticationService.authenticate({ requiredScopes: [], noBrowser: true }))
                        .rejects
                        .toThrow(apiError);

                    expect(readAuthToken).toHaveBeenCalled();
                    expect(inquirer.prompt).toHaveBeenCalled();
                    expect(authenticationService.zeplinApi.login).toHaveBeenCalledWith(samples.loginRequest);
                    expect(saveAuthToken).not.toHaveBeenCalled();
                });
            });

            describe("Browser login is not skipped.", () => {
                it("returns JWT when browser login flow is successful.", async () => {
                    const authenticationService = new AuthenticationService();

                    mocked(envUtil.isCI).mockReturnValueOnce(false);
                    mocked(readAuthToken).mockResolvedValueOnce("");
                    mocked(open).mockResolvedValueOnce(jest.fn() as unknown as ChildProcess);
                    mocked(inquirer.prompt)
                        .mockReturnValueOnce(new Promise((): void => {}) as Promise<unknown> & { ui: PromptUI });
                    mocked(authenticationService.loginServer.waitForToken).mockResolvedValueOnce(samples.validJwt);

                    const tokenPromies = authenticationService.authenticate();

                    await expect(tokenPromies)
                        .resolves
                        .toBe(samples.validJwt);

                    expect(readAuthToken).toHaveBeenCalled();
                    expect(open).toHaveBeenCalled();
                    expect(inquirer.prompt).not.toHaveReturnedWith(samples.validJwt);
                    expect(authenticationService.zeplinApi.login).not.toHaveBeenCalled();
                    expect(authenticationService.zeplinApi.generateToken).not.toHaveBeenCalled();
                    expect(authenticationService.loginServer.waitForToken)
                        .toHaveReturnedWith(Promise.resolve(samples.validJwt));
                    expect(saveAuthToken).toHaveBeenCalledWith(samples.validJwt);
                });

                it("returns JWT when browser login flow is unsuccessful but prompt login is successful.", async () => {
                    const authenticationService = new AuthenticationService();

                    mocked(envUtil.isCI).mockReturnValueOnce(false);
                    mocked(readAuthToken).mockResolvedValueOnce("");
                    mocked(open).mockResolvedValueOnce(jest.fn() as unknown as ChildProcess);
                    mocked(authenticationService.loginServer.waitForToken).mockResolvedValueOnce(undefined);
                    mocked(inquirer.prompt).mockResolvedValueOnce(samples.loginRequest);
                    mocked(authenticationService.zeplinApi.login).mockResolvedValueOnce(samples.loginResponse);
                    mocked(authenticationService.zeplinApi.generateToken).mockResolvedValueOnce(samples.validJwt);

                    await expect(authenticationService.authenticate())
                        .resolves
                        .toBe(samples.validJwt);

                    expect(readAuthToken).toHaveBeenCalled();
                    expect(open).toHaveBeenCalled();
                    expect(authenticationService.zeplinApi.generateToken)
                        .toHaveReturnedWith(Promise.resolve(samples.validJwt));
                    expect(authenticationService.loginServer.waitForToken)
                        .toHaveReturnedWith(Promise.resolve(undefined));
                    expect(saveAuthToken).toHaveBeenCalledWith(samples.validJwt);
                });
            });
        });

        describe("Token is retrieved from env variables.", () => {
            it("returns JWT when token is valid", async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.getAccessTokenFromEnv).mockReturnValueOnce(samples.validJwt);

                await expect(authenticationService.authenticate({ requiredScopes: [], noBrowser: true }))
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

                await expect(authenticationService.authenticate({ requiredScopes: ["write", "delete"], noBrowser: true }))
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

                await expect(authenticationService.authenticate({ requiredScopes: [], noBrowser: true }))
                    .rejects
                    .toThrowError(new AuthError("Invalid authentication token."));
            });

            it("throws 'Audience is not set in authentication token.' when token has no audience.", async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.getAccessTokenFromEnv).mockReturnValueOnce(samples.validJwtWithoutAudience);

                await expect(authenticationService.authenticate({ requiredScopes: [], noBrowser: true }))
                    .rejects
                    .toThrowError(new AuthError("Audience is not set in authentication token."));
            });

            it(dedent`throws 'Access token has missing privileges, please login again to re-create access token.' 
            when token does not have the required delete scope`, async () => {
                const authenticationService = new AuthenticationService();

                mocked(envUtil.getAccessTokenFromEnv).mockReturnValueOnce(samples.validJwtWithoutDeleteScope);

                await expect(authenticationService.authenticate({ requiredScopes: ["delete"], noBrowser: true }))
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

            await expect(authenticationService.promptForLogin({ ignoreSaveTokenErrors: true, noBrowser: true }))
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

            await expect(authenticationService.promptForLogin({ ignoreSaveTokenErrors: false, noBrowser: true }))
                .rejects
                .toThrowError(error);
        });
    });
});