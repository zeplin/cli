import { mocked } from "ts-jest/utils";
import { ConnectedComponentsService } from "../../src/commands/connect/service";
import * as samples from "../samples";
import { AuthenticationService } from "../../src/service/auth";
import { AuthError } from "../../src/errors";

jest.mock("../../src/service/auth");
jest.mock("../../src/api");

const getMockedAuthService = (): AuthenticationService => {
    const [currentInstance] = mocked(AuthenticationService).mock.instances;
    return currentInstance;
};

describe("ConnectedComponentsService", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("uploadConnectedBarrels", () => {
        describe("when not in CI session", () => {
            it("prompts for relogin once if authentication is fails", async () => {
                const service = new ConnectedComponentsService();

                const authError = new AuthError("Rich gifts wax poor when the givers prove unkind.");

                mocked(getMockedAuthService().authenticate).mockRejectedValueOnce(authError);
                mocked(getMockedAuthService().authenticate).mockResolvedValueOnce(samples.validJwt);

                await expect(service.uploadConnectedBarrels(samples.connectedComponentsProject))
                    .rejects
                    .toThrowError(authError);
            });

            it("prompts for relogin once if authentication is fails", async () => {
                const service = new ConnectedComponentsService();

                const authError = new AuthError("Rich gifts wax poor when the givers prove unkind.");

                mocked(getMockedAuthService().authenticate).mockRejectedValueOnce(authError);

                await expect(service.uploadConnectedBarrels(samples.connectedComponentsProject))
                    .rejects
                    .toThrowError(authError);
            });
        });
    });
});