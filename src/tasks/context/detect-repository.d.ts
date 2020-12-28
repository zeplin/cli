/** @internal */
export interface GitConfig {
    type: string;
    repository: string;
    owner: string;
    branch?: string;
}

/** @internal */
export interface DetectRepositoryContext {
    git?: GitConfig;
}