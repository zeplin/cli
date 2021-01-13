import parseGitUrl from "git-url-parse";
import parseGitConfig from "parse-git-config";
import { Task, TaskStep, transitionTo } from "../util/task";
import * as ui from "./ui/detect-git";
import { DetectGitContext } from "./context/detect-git";
import { BitbucketConfig } from "../commands/connect/interfaces/config";
import logger from "../util/logger";

const GITHUB_SOURCE = "github.com";
const GITLAB_SOURCE = "gitlab.com";
const BITBUCKET_CLOUD_SOURCE = "bitbucket.org";
const BITBUCKET_SERVER_SOURCE = "bitbucket-server";

const gitSourceTypes: Record<string, "github" | "gitlab" | "bitbucket"> = {
    [GITHUB_SOURCE]: "github",
    [GITLAB_SOURCE]: "gitlab",
    [BITBUCKET_CLOUD_SOURCE]: "bitbucket",
    [BITBUCKET_SERVER_SOURCE]: "bitbucket"
};

const defaultBranches = [
    "master",
    "main"
];

const createBitbucketServerConfig = ({
    protocol, host, repository, owner, branch
}: {
    protocol: string;
    host: string;
    repository: string;
    owner: string;
    branch?: string;
}): BitbucketConfig => {
    const bitbucketServerConfig: BitbucketConfig = {
        repository,
        url: `${protocol}://${host}`,
        branch
    };
    if (owner.startsWith("~")) {
        bitbucketServerConfig.user = owner;
    } else {
        bitbucketServerConfig.project = owner;
    }
    return bitbucketServerConfig;
};

const detect: TaskStep<DetectGitContext> = async (ctx, task) => {
    try {
        const gitConfig = await parseGitConfig({ expandKeys: true });
        const remoteUrl = gitConfig?.remote?.origin?.url;
        const branches = gitConfig?.branch || {};
        if (remoteUrl) {
            const branch = Object.keys(branches).find(b => defaultBranches.includes(b));

            const {
                owner,
                name: repository,
                source,
                resource: host,
                protocol
            } = parseGitUrl(remoteUrl);

            const type = gitSourceTypes[source];
            let config;

            if (type) {
                if (source === BITBUCKET_SERVER_SOURCE) {
                    config = createBitbucketServerConfig({
                        protocol, host, repository, owner, branch
                    });
                } else {
                    config = {
                        repository: `${owner}/${repository}`
                    };
                }
                ctx.git = { type, config };
            }
        }
    } catch (e) {
        logger.debug("Error occurred while detecting git config", e);
    }

    task.skip(ctx, ui.skipped);
};

export const detectGit = new Task<DetectGitContext>({
    steps: [
        detect,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
