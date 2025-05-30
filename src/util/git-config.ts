import path from "path";
import { promises as fs } from "fs";
import { parse as parseIni } from "ini";
import logger from "./logger";

interface GitConfigFileContent {
  remote?: { [remoteName: string]: { url?: string } };
  branchNames?: string[];
}

/**
 * Parses a Git config file and extracts only `remote.<name>.url` and branch names.
 *
 * @param {string} filePath Optional path to the Git config file (defaults to `.git/config` in the current working directory).
 * @returns {GitConfigFileContent} A promise that resolves to a simplified Git config object containing only remotes and branch names, or `null` if the file cannot be read or parsed.
 */
async function parseGitConfig(filePath?: string): Promise<GitConfigFileContent | null> {
    const configPath = filePath || path.join(process.cwd(), ".git", "config");

    try {
        let content = await fs.readFile(configPath, "utf-8");
        // Escape dots in quoted section names like [remote "origin.prod"]
        content = content.replace(/\[(\S+) "(.*)"\]/g, (_, section, name) => {
            const escapedName = name.split(".").join("\\.");
            return `[${section} "${escapedName}"]`;
        });

        // Parse the INI content
        const parsedFileContent = parseIni(content);

        // Build the simplified git config object
        const result: GitConfigFileContent = {};
        // Map needed sections to the config
        for (const [sectionKey, value] of Object.entries(parsedFileContent)) {
            // Parse remote sections: "remote <name>"
            const remoteSectionMatch = sectionKey.match(/^remote\s+"(.+)"$/i);
            if (remoteSectionMatch && value.url) {
                const [_, remoteName] = remoteSectionMatch;
                result.remote = result.remote || {};
                result.remote[remoteName] = { url: value.url };
                continue; // eslint-disable-line no-continue
            }

            // Parse branch sections: "branch <name>"
            const branchSectionMatch = sectionKey.match(/^branch\s+"(.+)"$/i);
            if (branchSectionMatch) {
                const [_, branchName] = branchSectionMatch;
                result.branchNames = result.branchNames || [];
                result.branchNames.push(branchName);
            }
        }

        return result;
    } catch (err: any) {
        logger.debug(`Error occurrent while parsing git config: ${err.stack}`);
        return null;
    }
}

export {
    parseGitConfig
};
