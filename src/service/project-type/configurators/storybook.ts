import { supportedStorybookFrameworks } from "../storybook";
import { gt, minVersion, SemVer } from "semver";
import { Command } from "commander";
import logger from "../../../util/logger";
import { getDependencyVersion } from "../../../util/js/dependency";
import { Configurator } from ".";
import { PackageJson } from "../../../util/js/config";

const defaultHost = "localhost";
const defaultPort = "9009";

export function storybookConfiguratorFactory(): Configurator {
    return (packageJson?: PackageJson): {} => {
        const config: Record<string, string> = {
            url: `http://${defaultHost}:${defaultPort}/`
        };

        if (packageJson) {
            const [foundVersion] = supportedStorybookFrameworks.map(d => getDependencyVersion(packageJson, d));
            if (foundVersion && gt(minVersion(foundVersion) as SemVer, minVersion("4") as SemVer)) {
                config.format = "new";
            }

            if (packageJson.scripts) {
                const program = new Command()
                    .option("-p, --port <port>")
                    .option("-h, --host <host>")
                    .option("--https")
                    .allowUnknownOption();

                const foundScript = Object.entries(packageJson.scripts)
                    .find(([, v]) => v.indexOf("start-storybook") !== -1);

                if (foundScript) {
                    const [scriptName, scriptValue] = foundScript;

                    logger.debug(`Found storybook script "${scriptName}": "${scriptValue}"`);

                    const sbCommand = (scriptValue.split("&&")
                        .reduce((prev, curr) => prev.concat(curr.split("||")), [] as string[])
                        .find(v => v.trim().startsWith("start-storybook"))) || "";

                    if (sbCommand) {
                        const sbArgs = sbCommand.split(" ").map(a => a.trim());

                        const { host, port, https } = program.parse(sbArgs, { from: "user" });

                        const protocol = https ? "https" : "http";
                        config.url = `${protocol}://${host || defaultHost}:${port || defaultPort}/`;
                        config.startScript = scriptName;
                    }
                }
            }
        }

        return config;
    };
}
