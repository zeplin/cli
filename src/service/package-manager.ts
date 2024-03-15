import { detect, getNpmVersion, PM } from "detect-package-manager";
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

export async function getPackageManagerVersion(pm: PM): Promise<number | undefined> {
    const version = await getNpmVersion(pm);
    const parsedVersion = parseInt(version, 10);

    if (!isNaN(parsedVersion)) {
        return parsedVersion;
    }

    return undefined;
}

export async function installPackages(packages: Record<string, string>, { installGlobal = false } = {}): Promise<void> {
    const pm = await detect();
    const version = await getPackageManagerVersion(pm);
    const args = [];

    if (pm === "yarn") {
        if (installGlobal) {
            args.push("global");
        } else if (version && version === 1) {
            args.push("--ignore-workspace-root-check", "--dev");
        } else {
            args.push("--dev");
        }
        args.push("add");
    } else if (pm === "npm") {
        args.push("install");
        if (installGlobal) {
            args.push("--global");
        } else {
            args.push("--save-dev");
        }
    } else if (pm === "pnpm") {
        throw new Error("Not implemented");
    } else if (pm === "bun") {
        throw new Error("Not implemented");
    } else {
        throw new Error("Not supported package manager");
    }

    const packagesWithVersions = Object.keys(packages).map(p => `${p}@${packages[p]}`);

    const command = `${pm} ${args.join(" ")} ${packagesWithVersions.join(" ")}`;

    await runCommand(command);
}
