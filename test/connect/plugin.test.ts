import { connectComponentConfigFiles } from "../../src/commands/connect/plugin";
import * as samples from "../samples";
import * as packageUtils from "../../src/util/package";

jest.mock("../../src/util/package");

describe("PluginProcessor", () => {
    describe("when plugin not exists", () => {
        const { sampleConfig } = samples;
        sampleConfig.plugins = [{ name: "non-existent-plugin" }];
        afterEach(() => {
            jest.restoreAllMocks();
            jest.resetAllMocks();
        });

        describe("and CLI is globally installed in using yarn", () => {
            it("fails and prints instructions", async () => {
                jest.mocked(packageUtils.isRunningFromYarnGlobal).mockReturnValue(true);
                jest.mocked(packageUtils.isRunningFromGlobal).mockReturnValue(true);

                await expect(connectComponentConfigFiles([sampleConfig]))
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });
        });

        describe("and CLI is globally installed in using npm", () => {
            it("fails and prints instructions", async () => {
                jest.mocked(packageUtils.isRunningFromGlobal).mockReturnValue(true);
                await expect(connectComponentConfigFiles([sampleConfig]))
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });
        });

        describe("and CLI is locally installed using yarn", () => {
            it("fails and prints instructions", async () => {
                jest.mocked(packageUtils.projectHasYarn).mockReturnValue(true);

                await expect(connectComponentConfigFiles([sampleConfig]))
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });
        });

        describe("and CLI is locally installed using npm", () => {
            it("fails and prints instructions", async () => {
                await expect(connectComponentConfigFiles([sampleConfig]))
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });
        });
    });
});
