import latestVersion from "latest-version";
import hasYarn from "has-yarn";
import { runCommand } from "../util/command";

export async function getLatestVersions(packages: string[]): Promise<Record<string, string>> {
    const versions: Record<string, string> = {};

    await Promise.all(packages.map(async p => {
        versions[p] = await latestVersion(p);
    }));

    return versions;
}

export async function installPackages(packages: Record<string, string>, { installGlobal = false } = {}): Promise<void> {
    const yarn = hasYarn();
    const args = [];
    const command = yarn ? "yarn" : "npm";

    if (yarn) {
        if (installGlobal) {
            args.push("global");
        }
        args.push("add", "-D");
    } else {
        if (installGlobal) {
            args.push("-g");
        }
        args.push("install", "-D");
    }

    const packagesWithVersions = Object.keys(packages).map(p => `${p}@${packages[p]}`);

    const fullCommand = `${command} ${args.join(" ")} ${packagesWithVersions.join(" ")}`;

    await runCommand(fullCommand);
}
