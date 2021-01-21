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
    const npmClient = yarn ? "yarn" : "npm";

    if (yarn) {
        if (installGlobal) {
            args.push("global");
        } else {
            args.push("--ignore-workspace-root-check", "--save-dev");
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
