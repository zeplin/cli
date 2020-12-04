import { mocked } from "ts-jest/utils";
import { ConnectedComponentsService } from "../../src/commands/connect/service";
import * as samples from "../samples";
import { AuthError } from "../../src/errors";
import { isCI } from "../../src/util/env";

jest.mock("../../src/service/auth");
jest.mock("../../src/api");
jest.mock("../../src/util/env");

describe("ConnectedComponentsService", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("uploadConnectedBarrels", () => {
        describe("when not in CI session", () => {
            it("prompts for relogin once when authentication fails and then uploads", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const authError = new AuthError("Rich gifts wax poor when the givers prove unkind.");

                mocked(service.authService.authenticate).mockRejectedValueOnce(authError);
                mocked(service.authService.promptForLogin).mockResolvedValueOnce(samples.validJwt);

                await service.uploadConnectedBarrels([sample]);

                expect(service.authService.promptForLogin).toHaveBeenCalledTimes(1);

                const uploadExpectationFn = (barrelId: string, barrelType: string): void => {
                    expect(service.zeplinApi.uploadConnectedComponents)
                        .toHaveBeenCalledWith(
                            samples.validJwt,
                            { barrelId, barrelType },
                            { connectedComponents: sample.connectedComponents }
                        );
                };

                sample.projects.forEach(pid => uploadExpectationFn(pid, "projects"));
                sample.styleguides.forEach(stid => uploadExpectationFn(stid, "styleguides"));

                expect(service.zeplinApi.uploadConnectedComponents)
                    .toHaveBeenCalledTimes(sample.projects.length + sample.styleguides.length);
            });

            it("prompts for relogin once when upload fails with auth error and then uploads", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const authError = new AuthError("Rich gifts wax poor when the givers prove unkind.");

                mocked(service.authService.authenticate).mockResolvedValueOnce(samples.invalidJwt);
                mocked(service.authService.promptForLogin).mockResolvedValueOnce(samples.validJwt);
                mocked(service.zeplinApi.uploadConnectedComponents).mockRejectedValueOnce(authError);

                await service.uploadConnectedBarrels([sample]);

                expect(service.authService.promptForLogin).toHaveBeenCalledTimes(1);

                const uploadExpectationFn = (barrelId: string, barrelType: string): void => {
                    expect(service.zeplinApi.uploadConnectedComponents)
                        .toHaveBeenCalledWith(
                            samples.validJwt,
                            { barrelId, barrelType },
                            { connectedComponents: sample.connectedComponents }
                        );
                };

                sample.projects.forEach(pid => uploadExpectationFn(pid, "projects"));
                sample.styleguides.forEach(stid => uploadExpectationFn(stid, "styleguides"));
            });

            it("does not prompt again and throws error when authentication fails for a second time", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const authError = new AuthError("");

                mocked(service.authService.authenticate).mockRejectedValueOnce(authError);
                mocked(service.authService.promptForLogin).mockRejectedValueOnce(authError);

                await expect(service.uploadConnectedBarrels([sample]))
                    .rejects
                    .toThrowError(authError);

                expect(service.authService.promptForLogin).toHaveBeenCalledTimes(1);
                expect(service.zeplinApi.uploadConnectedComponents).not.toHaveBeenCalled();
            });

            it("does not prompt and throws error when authentication fails with an arbitrary error", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const error = new Error("");

                mocked(service.authService.authenticate).mockRejectedValueOnce(error);

                await expect(service.uploadConnectedBarrels([sample]))
                    .rejects
                    .toThrowError(error);

                expect(service.authService.promptForLogin).not.toHaveBeenCalled();
                expect(service.zeplinApi.uploadConnectedComponents).not.toHaveBeenCalled();
            });

            it("does not prompt and throws error when upload fails with an arbitrary error", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const error = new Error("");

                mocked(service.authService.authenticate).mockResolvedValueOnce(samples.validJwt);
                mocked(service.zeplinApi.uploadConnectedComponents).mockRejectedValueOnce(error);

                await expect(service.uploadConnectedBarrels([sample]))
                    .rejects
                    .toThrowError(error);

                expect(service.authService.promptForLogin).not.toHaveBeenCalled();
                expect(service.zeplinApi.uploadConnectedComponents).toHaveBeenCalled();
            });

            it("does not prompt when authentication succeeds and then uploads", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                mocked(service.authService.authenticate).mockResolvedValueOnce(samples.validJwt);

                await service.uploadConnectedBarrels([sample]);

                expect(service.authService.promptForLogin).not.toHaveBeenCalled();

                const uploadExpectationFn = (barrelId: string, barrelType: string): void => {
                    expect(service.zeplinApi.uploadConnectedComponents)
                        .toHaveBeenCalledWith(
                            samples.validJwt,
                            { barrelId, barrelType },
                            { connectedComponents: sample.connectedComponents }
                        );
                };

                sample.projects.forEach(pid => uploadExpectationFn(pid, "projects"));
                sample.styleguides.forEach(pid => uploadExpectationFn(pid, "styleguides"));

                expect(service.zeplinApi.uploadConnectedComponents)
                    .toHaveBeenCalledTimes(sample.projects.length + sample.styleguides.length);
            });

            describe("when in CI session", () => {
                beforeEach(() => {
                    mocked(isCI).mockReturnValue(true);
                });
                it("does not prompt when authentication fails and throw error", async () => {
                    const sample = samples.connectedComponents;
                    const service = new ConnectedComponentsService();

                    const authError = new AuthError("Rich gifts wax poor when the givers prove unkind.");

                    mocked(service.authService.authenticate).mockRejectedValueOnce(authError);

                    await expect(service.uploadConnectedBarrels([sample]))
                        .rejects
                        .toThrowError(authError);

                    expect(service.authService.promptForLogin).not.toHaveBeenCalled();
                    expect(service.zeplinApi.uploadConnectedComponents).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe("deleteConnectedBarrels", () => {
        describe("when not in CI session", () => {
            it("prompts for relogin once when authentication fails and then deletes", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const authError = new AuthError("Rich gifts wax poor when the givers prove unkind.");

                mocked(service.authService.authenticate).mockRejectedValueOnce(authError);
                mocked(service.authService.promptForLogin).mockResolvedValueOnce(samples.validJwt);

                await service.deleteConnectedBarrels([sample]);

                expect(service.authService.promptForLogin).toHaveBeenCalledTimes(1);

                const deleteExpectationFn = (barrelId: string, barrelType: string): void => {
                    expect(service.zeplinApi.deleteConnectedComponents)
                        .toHaveBeenCalledWith(
                            samples.validJwt,
                            { barrelId, barrelType }
                        );
                };

                sample.projects.forEach(pid => deleteExpectationFn(pid, "projects"));
                sample.styleguides.forEach(stid => deleteExpectationFn(stid, "styleguides"));

                expect(service.zeplinApi.deleteConnectedComponents)
                    .toHaveBeenCalledTimes(sample.projects.length + sample.styleguides.length);
            });

            it("prompts for relogin once when delete fails with auth error and then deletes", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const authError = new AuthError("Rich gifts wax poor when the givers prove unkind.");

                mocked(service.authService.authenticate).mockResolvedValueOnce(samples.invalidJwt);
                mocked(service.authService.promptForLogin).mockResolvedValueOnce(samples.validJwt);
                mocked(service.zeplinApi.deleteConnectedComponents).mockRejectedValueOnce(authError);

                await service.deleteConnectedBarrels([sample]);

                expect(service.authService.promptForLogin).toHaveBeenCalledTimes(1);

                const deleteExpectationFn = (barrelId: string, barrelType: string): void => {
                    expect(service.zeplinApi.deleteConnectedComponents)
                        .toHaveBeenCalledWith(
                            samples.validJwt,
                            { barrelId, barrelType }
                        );
                };

                sample.projects.forEach(pid => deleteExpectationFn(pid, "projects"));
                sample.styleguides.forEach(stid => deleteExpectationFn(stid, "styleguides"));
            });

            it("does not prompt again and throws error when authentication fails for a second time", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const authError = new AuthError("");

                mocked(service.authService.authenticate).mockRejectedValueOnce(authError);
                mocked(service.authService.promptForLogin).mockRejectedValueOnce(authError);

                await expect(service.deleteConnectedBarrels([sample]))
                    .rejects
                    .toThrowError(authError);

                expect(service.authService.promptForLogin).toHaveBeenCalledTimes(1);
                expect(service.zeplinApi.deleteConnectedComponents).not.toHaveBeenCalled();
            });

            it("does not prompt and throws error when authentication fails with an arbitrary error", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const error = new Error("");

                mocked(service.authService.authenticate).mockRejectedValueOnce(error);

                await expect(service.deleteConnectedBarrels([sample]))
                    .rejects
                    .toThrowError(error);

                expect(service.authService.promptForLogin).not.toHaveBeenCalled();
                expect(service.zeplinApi.deleteConnectedComponents).not.toHaveBeenCalled();
            });

            it("does not prompt and throws error when delete fails with an arbitrary error", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                const error = new Error("");

                mocked(service.authService.authenticate).mockResolvedValueOnce(samples.validJwt);
                mocked(service.zeplinApi.deleteConnectedComponents).mockRejectedValueOnce(error);

                await expect(service.deleteConnectedBarrels([sample]))
                    .rejects
                    .toThrowError(error);

                expect(service.authService.promptForLogin).not.toHaveBeenCalled();
                expect(service.zeplinApi.deleteConnectedComponents).toHaveBeenCalled();
            });

            it("does not prompt when authentication succeeds and then deletes", async () => {
                const sample = samples.connectedComponents;
                const service = new ConnectedComponentsService();

                mocked(service.authService.authenticate).mockResolvedValueOnce(samples.validJwt);

                await service.deleteConnectedBarrels([sample]);

                expect(service.authService.promptForLogin).not.toHaveBeenCalled();

                const deleteExpectationFn = (barrelId: string, barrelType: string): void => {
                    expect(service.zeplinApi.deleteConnectedComponents)
                        .toHaveBeenCalledWith(
                            samples.validJwt,
                            { barrelId, barrelType }
                        );
                };

                sample.projects.forEach(pid => deleteExpectationFn(pid, "projects"));
                sample.styleguides.forEach(pid => deleteExpectationFn(pid, "styleguides"));

                expect(service.zeplinApi.deleteConnectedComponents)
                    .toHaveBeenCalledTimes(sample.projects.length + sample.styleguides.length);
            });

            describe("when in CI session", () => {
                beforeEach(() => {
                    mocked(isCI).mockReturnValue(true);
                });
                it("does not prompt when authentication fails and throw error", async () => {
                    const sample = samples.connectedComponents;
                    const service = new ConnectedComponentsService();

                    const authError = new AuthError("Rich gifts wax poor when the givers prove unkind.");

                    mocked(service.authService.authenticate).mockRejectedValueOnce(authError);

                    await expect(service.deleteConnectedBarrels([sample]))
                        .rejects
                        .toThrowError(authError);

                    expect(service.authService.promptForLogin).not.toHaveBeenCalled();
                    expect(service.zeplinApi.deleteConnectedComponents).not.toHaveBeenCalled();
                });
            });
        });
    });
});