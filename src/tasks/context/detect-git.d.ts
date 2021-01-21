import { GitConfig, BitbucketConfig } from "../../types";

export interface DetectedGitConfig {
    type: "bitbucket" | "github" | "gitlab";
    config: GitConfig | BitbucketConfig;
}

export interface DetectGitContext {
    git?: DetectedGitConfig;
}