import parseGitUrl from "git-url-parse";
import parseGitConfig from "parse-git-config";
import { Task, TaskStep, transitionTo } from "../util/task";
import * as ui from "./ui/detect-repository";
import { DetectRepositoryContext } from "./context/detect-repository";

const gitSourceTypes = [
    "bitbucket",
    "github",
    "gitlab"
];

const defaultBranches = [
    "master",
    "main"
];

const detect: TaskStep<DetectRepositoryContext> = async (ctx, task) => {
    try {
        const gitConfig = await parseGitConfig({ expandKeys: true });
        const remoteUrl = gitConfig?.remote?.origin?.url;
        const branches = gitConfig?.branch || {};
        if (remoteUrl) {
            const branch = Object.keys(branches).find(b => defaultBranches.includes(b));

            const {
                owner,
                name: repository,
                source
            } = parseGitUrl(remoteUrl);
            const type = gitSourceTypes.find(gitSourceType => source.indexOf(gitSourceType) !== -1);

            if (type) {
                ctx.git = {
                    owner,
                    repository,
                    type,
                    branch
                };
                return;
            }
        }
    } catch (e) {
        // Ignore
    }

    task.skip(ctx, ui.skipped);
};

export const detectRepository = new Task({
    steps: [
        detect,
        transitionTo(ui.completed)
    ],
    initial: ui.initial
});
