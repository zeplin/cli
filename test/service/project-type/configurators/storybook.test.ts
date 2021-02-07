import { storybookConfiguratorFactory } from "../../../../src/service/project-type/configurators/storybook";
import { supportedStorybookFrameworks } from "../../../../src/service/project-type/storybook";

const storybookConfigurator = storybookConfiguratorFactory();

describe("Storybook configurator", () => {
    test("should detect storybook config", () => {
        const config = storybookConfigurator({
            scripts: {
                storybook: "start-storybook"
            }
        });

        expect(config).toStrictEqual({
            url: "http://localhost:9009/",
            startScript: "storybook"
        });
    });

    test("should detect storybook config with custom port", () => {
        const config = storybookConfigurator({
            scripts: {
                storybook: "start-storybook -p 1234"
            }
        });

        expect(config).toStrictEqual({
            url: "http://localhost:1234/",
            startScript: "storybook"
        });
    });

    test("should detect storybook config with custom host", () => {
        const config = storybookConfigurator({
            scripts: {
                storybook: "start-storybook -h example.com"
            }
        });

        expect(config).toStrictEqual({
            url: "http://example.com:9009/",
            startScript: "storybook"
        });
    });

    test("should detect storybook config with https", () => {
        const config = storybookConfigurator({
            scripts: {
                storybook: "start-storybook --https"
            }
        });

        expect(config).toStrictEqual({
            url: "https://localhost:9009/",
            startScript: "storybook"
        });
    });

    test("should detect storybook config with custom host and https", () => {
        const config = storybookConfigurator({
            scripts: {
                storybook: "start-storybook -h example.com --https"
            }
        });

        expect(config).toStrictEqual({
            url: "https://example.com:9009/",
            startScript: "storybook"
        });
    });

    test("should detect storybook config with custom host and port", () => {
        const config = storybookConfigurator({
            scripts: {
                storybook: "start-storybook -h example.com -p 1234"
            }
        });

        expect(config).toStrictEqual({
            url: "http://example.com:1234/",
            startScript: "storybook"
        });
    });

    test("should detect storybook config with custom host, port and https", () => {
        const config = storybookConfigurator({
            scripts: {
                storybook: "start-storybook -h example.com -p 1234 --https"
            }
        });

        expect(config).toStrictEqual({
            url: "https://example.com:1234/",
            startScript: "storybook"
        });
    });

    test("should detect storybook config with storybook v5+", () => {
        const config = storybookConfigurator({
            devDependencies: {
                [`${supportedStorybookFrameworks[0]}`]: "5.0.0"
            },
            scripts: {
                storybook: "start-storybook"
            }
        });

        expect(config).toStrictEqual({
            url: "http://localhost:9009/",
            startScript: "storybook",
            format: "new"
        });
    });

    test("should detect storybook config with storybook v5+", () => {
        const config = storybookConfigurator({
            devDependencies: {
                [`${supportedStorybookFrameworks[0]}`]: "5.0.0"
            },
            scripts: {
                storybook: "start-storybook"
            }
        });

        expect(config).toStrictEqual({
            url: "http://localhost:9009/",
            startScript: "storybook",
            format: "new"
        });
    });

    test("should detect storybook config if the script contains multiple commands", () => {
        const config = storybookConfigurator({
            scripts: {
                storybook: "some-other-command -p param && start-storybook -p 1234 -h example.com || some-other-command -p param"
            }
        });

        expect(config).toStrictEqual({
            url: "http://example.com:1234/",
            startScript: "storybook"
        });
    });
});