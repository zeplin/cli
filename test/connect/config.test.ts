import path from "path";

import { getComponentConfigFiles } from "../../src/commands/connect/config";

const configResourcePath = path.resolve("test", "resources", "config");

describe("ConfigProcessor", () => {
    describe("when no config file option is passed", () => {
        describe("and no default config file is discovered", () => {
            it("fails", async () => {
                await expect(getComponentConfigFiles([], []))
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });
        });

        describe("and discovered config file is invalid", () => {
            it("fails", async () => {
                const searchFrom = path.join(configResourcePath, "invalid");

                await expect(getComponentConfigFiles([], [], searchFrom))
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });
        });

        describe("and json config file is discovered", () => {
            it("parses the config", async () => {
                const searchFrom = path.join(configResourcePath, "json");

                await expect(getComponentConfigFiles([], [], searchFrom))
                    .resolves
                    .toMatchSnapshot();
            });
        });

        describe("and json with comments config file is discovered", () => {
            it("parses the config", async () => {
                const searchFrom = path.join(configResourcePath, "jsonc");

                await expect(getComponentConfigFiles([], [], searchFrom))
                    .resolves
                    .toMatchSnapshot();
            });
        });

        describe("and yaml config file is discovered", () => {
            it("parses the config", async () => {
                const searchFrom = path.join(configResourcePath, "yaml");

                await expect(getComponentConfigFiles([], [], searchFrom))
                    .resolves
                    .toMatchSnapshot();
            });
        });
    });

    describe("when config file options are passed", () => {
        describe("and they are valid", () => {
            it("parses the config files", async () => {
                const configFilePath1 = path.join(configResourcePath, "json", ".zeplin", "components.json");
                const configFilePath2 = path.join(configResourcePath, "yaml", ".zeplin", "components.yaml");

                const configFilePaths = [configFilePath1, configFilePath2];

                await expect(getComponentConfigFiles(configFilePaths, []))
                    .resolves
                    .toMatchSnapshot();
            });
        });

        describe("and at least one is invalid", () => {
            it("fails", async () => {
                const configFilePath1 = path.join(configResourcePath, "json", ".zeplin", "components.json");
                const configFilePath2 = path.join(configResourcePath, "invalid", ".zeplin", "components.json");

                const configFilePaths = [configFilePath1, configFilePath2];

                await expect(getComponentConfigFiles(configFilePaths, []))
                    .rejects
                    .toThrowErrorMatchingSnapshot();
            });
        });
    });
});
