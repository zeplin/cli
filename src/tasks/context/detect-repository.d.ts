export interface GitConfig {
    type: string;
    repository: string;
    owner: string;
    branch?: string;
}

export interface DetectRepositoryContext {
    git?: GitConfig;
}