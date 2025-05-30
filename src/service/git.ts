import parseGitUrl from "git-url-parse";
import { stringify } from "../util/text";
import { parseGitConfig } from "../util/git-config";
import logger from "../util/logger";
import { BitbucketConfig, GitConfig } from "../commands/connect/interfaces/config";

const GITHUB_SOURCE = "github.com";
const GITLAB_SOURCE = "gitlab.com";
const BITBUCKET_CLOUD_SOURCE = "bitbucket.org";
const BITBUCKET_SERVER_SOURCE = "bitbucket-server";

enum GitSource {
    github = "github",
    gitlab = "gitlab",
    bitbucket = "bitbucket"
}

const gitSourceTypes: Record<string, GitSource> = {
    [GITHUB_SOURCE]: GitSource.github,
    [GITLAB_SOURCE]: GitSource.gitlab,
    [BITBUCKET_CLOUD_SOURCE]: GitSource.bitbucket,
    [BITBUCKET_SERVER_SOURCE]: GitSource.bitbucket
};

const defaultBranches = [
    "master",
    "main"
];

const createBitbucketServerConfig = ({
    host, repository, owner, branch
}: {
    host: string;
    repository: string;
    owner: string;
    branch?: string;
}): BitbucketConfig => {
    const bitbucketServerConfig: BitbucketConfig = {
        repository,
        url: `https://${host}`,
        branch
    };
    if (owner.startsWith("~")) {
        bitbucketServerConfig.user = owner;
    } else {
        bitbucketServerConfig.project = owner;
    }
    return bitbucketServerConfig;
};

export async function detectGit(
    params?: { path?: string }
): Promise<{
    type: "bitbucket" | "github" | "gitlab";
    config: GitConfig;
} | null> {
    const gitConfig = await parseGitConfig(params?.path);
    const remoteUrl = gitConfig?.remote?.origin?.url;
    const branches = gitConfig?.branchNames || [];
    logger.debug(`Git remoteUrl: ${remoteUrl}`);
    if (remoteUrl) {
        const branch = branches.find(b => defaultBranches.includes(b));
        logger.debug(`Git default branch: ${branch}`);

        const {
            owner,
            name: repository,
            source,
            resource,
            port,
            protocol
        } = parseGitUrl(remoteUrl);

        const portSuffix = ["http", "https"].includes(protocol) && port ? `:${port}` : "";
        const host = `${resource}${portSuffix}`;

        let config: GitConfig;

        let isSelfHosted = false;
        let type: GitSource | undefined = gitSourceTypes[source];
        if (!type) {
            type = Object.keys(GitSource).find(gs => host.includes(gs)) as GitSource;
            if (type) {
                isSelfHosted = true;
            }
        }

        logger.debug(`Git configuration: ${stringify({
            owner,
            repository,
            source,
            host,
            protocol,
            type,
            isSelfHosted
        })}`);

        if (type) {
            if (source === BITBUCKET_SERVER_SOURCE ||
                (type === GitSource.bitbucket && isSelfHosted)) {
                config = createBitbucketServerConfig({
                    host, repository, owner, branch
                });
            } else {
                config = {
                    repository: `${owner}/${repository}`,
                    ...(isSelfHosted ? { url: `https://${host}` } : {})
                };
            }
            return { type, config };
        }
    }
    return null;
}
