import { supportedStorybookFrameworks } from "../storybook";
import { gt, minVersion, SemVer } from "semver";
import { ArgumentParser } from "argparse";
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
                const argparser = new ArgumentParser({ prog: "start-storybook", addHelp: false });
                argparser.addArgument(["-h", "--host"]);
                argparser.addArgument(["-p", "--port"]);
                argparser.addArgument(["--https"], { type: Boolean });

                const foundScript = Object.entries(packageJson.scripts).find(([, v]) => v.startsWith("start-storybook"));
                if (foundScript) {
                    const [scriptName, scriptValue] = foundScript;
                    logger.debug(`Found storybook script "${scriptName}": "${scriptValue}"`);
                    const scriptArgs = scriptValue.split(" ").map(a => a.trim());
                    const [{ host, port, https }] = argparser.parseKnownArgs(scriptArgs);
                    const protocol = https ? "https" : "http";
                    config.url = `${protocol}://${host || defaultHost}:${port || defaultPort}/`;
                    config.startScript = scriptName;
                }
            }
        }

        return config;
    };
}
