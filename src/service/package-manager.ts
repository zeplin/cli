import hasYarn from "has-yarn";
import latestVersion from "latest-version";
import semver from "semver";
import { CLIError } from "../errors/CLIError";
import { runCommand } from "../util/command";
import logger from "../util/logger";

async function getLatestVersionUsingNpm(packageName: string): Promise<string> {
    try {
        const out = await runCommand(`npm view ${packageName} versions --json`) || "[]";
        const versions = Array.from<string>(JSON.parse(out));
        const latestStable = versions.reverse().find(v => semver.parse(v)?.prerelease.length === 0);
        if (!latestStable) {
            throw new CLIError("Could not find latest version on the list");
        }

        return latestStable;
    } catch (err: any) {
        logger.debug(err.stack);
        throw new CLIError("Could not get latest version");
    }
}

async function getLatestVersion(packageName: string): Promise<string> {
    try {
        return await latestVersion(packageName);
    } catch (err: any) {
        logger.debug(`Error occurrent on latest-version package: ${err.stack}`);
        return getLatestVersionUsingNpm(packageName);
    }
}

export async function getLatestVersions(packages: string[]): Promise<Record<string, string>> {
    const versions: Record<string, string> = {};

    await Promise.all(packages.map(async p => {
        versions[p] = await getLatestVersion(p);
    }));

    return versions;
}

export async function installPackages(packages: Record<string, string>, { installGlobal = false } = {}): Promise<void> {
    const yarn = hasYarn();
    const args = [];
    const npmClient = yarn ? "yarn" : "npm";

    if (yarn) {
        if (installGlobal) {
            args.push("global");
        } else {
            args.push("--ignore-workspace-root-check", "--dev");
        }
        args.push("add");
    } else {
        args.push("install");
        if (installGlobal) {
            args.push("--global");
        } else {
            args.push("--save-dev");
        }
    }

    const packagesWithVersions = Object.keys(packages).map(p => `${p}@${packages[p]}`);

    const command = `${npmClient} ${args.join(" ")} ${packagesWithVersions.join(" ")}`;

    await runCommand(command);
}
