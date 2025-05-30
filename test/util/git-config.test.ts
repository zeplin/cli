import path from "path";
import { promises as fs } from "fs";
import { parseGitConfig } from "../../src/util/git-config";
import logger from "../../src/util/logger";

jest.mock("fs", () => ({
    promises: {
        readFile: jest.fn()
    }
}));

jest.mock("../../src/util/logger", () => ({
    debug: jest.fn()
}));

describe("parseGitConfig", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        process.cwd = jest.fn().mockReturnValue("/mock/cwd");
    });

    it("should return null when file cannot be read", async () => {
        (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error("File not found"));

        const result = await parseGitConfig();

        expect(result).toBeNull();
        expect(fs.readFile).toHaveBeenCalledWith(path.join("/mock/cwd", ".git", "config"), "utf-8");
    });

    it("should log detailed error message with stack trace when an error occurs", async () => {
        // Create an error with more detail to test complete stack trace logging
        const mockError = new Error("Test error with details");
        mockError.stack = `Error: Test error with details
            at Object.<anonymous> (test/util/git-config.test.ts:42:13)
            at runMicrotasks (<anonymous>:3:12)
            at processTicksAndRejections
            (node:internal/process/task_queues:96:5)
        `;
        (fs.readFile as jest.Mock).mockRejectedValueOnce(mockError);

        const result = await parseGitConfig();

        expect(result).toBeNull();
        expect(logger.debug).toHaveBeenCalledWith(
            `Error occurrent while parsing git config: ${mockError.stack}`
        );
    });

    it("should use the default path when no path is provided", async () => {
        (fs.readFile as jest.Mock).mockResolvedValueOnce("");

        await parseGitConfig();

        expect(fs.readFile).toHaveBeenCalledWith(path.join("/mock/cwd", ".git", "config"), "utf-8");
    });

    it("should use the provided path when specified", async () => {
        const customPath = "/custom/path/to/.git/config";
        (fs.readFile as jest.Mock).mockResolvedValueOnce("");

        await parseGitConfig(customPath);

        expect(fs.readFile).toHaveBeenCalledWith(customPath, "utf-8");
    });

    it("should parse remote sections correctly", async () => {
        const gitConfig = `
[remote "origin"]
    url = git@github.com:owner/example.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[remote "upstream"]
    url = https://github.com/upstream/example.git
`;
        (fs.readFile as jest.Mock).mockResolvedValueOnce(gitConfig);

        const result = await parseGitConfig();

        expect(result).toEqual({
            remote: {
                origin: { url: "git@github.com:owner/example.git" },
                upstream: { url: "https://github.com/upstream/example.git" }
            }
        });
    });

    it("should parse branch sections correctly", async () => {
        const gitConfig = `
[branch "master"]
    remote = origin
    merge = refs/heads/master
[branch "develop"]
    remote = origin
    merge = refs/heads/develop
`;
        (fs.readFile as jest.Mock).mockResolvedValueOnce(gitConfig);

        const result = await parseGitConfig();

        expect(result).toEqual({
            branchNames: ["master", "develop"]
        });
    });

    it("should parse both remote and branch sections", async () => {
        const gitConfig = `
[remote "origin"]
    url = git@github.com:owner/example.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
    remote = origin
    merge = refs/heads/master
[branch "develop"]
    remote = origin
    merge = refs/heads/develop
`;
        (fs.readFile as jest.Mock).mockResolvedValueOnce(gitConfig);

        const result = await parseGitConfig();

        expect(result).toEqual({
            remote: {
                origin: { url: "git@github.com:owner/example.git" }
            },
            branchNames: ["master", "develop"]
        });
    });

    it("should escape dots in quoted section names", async () => {
        const gitConfig = `
[remote "origin.prod"]
    url = git@github.com:owner/example.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "feature.branch"]
    remote = origin
    merge = refs/heads/feature.branch
`;
        (fs.readFile as jest.Mock).mockResolvedValueOnce(gitConfig);

        const result = await parseGitConfig();

        expect(result).toEqual({
            remote: {
                "origin.prod": { url: "git@github.com:owner/example.git" }
            },
            branchNames: ["feature.branch"]
        });
    });

    it("should ignore sections other than remote and branch", async () => {
        const gitConfig = `
[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
    logallrefupdates = true
[remote "origin"]
    url = git@github.com:owner/example.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[branch "master"]
    remote = origin
    merge = refs/heads/master
[user]
    name = Test User
    email = test@example.com
`;
        (fs.readFile as jest.Mock).mockResolvedValueOnce(gitConfig);

        const result = await parseGitConfig();

        expect(result).toEqual({
            remote: {
                origin: { url: "git@github.com:owner/example.git" }
            },
            branchNames: ["master"]
        });
    });

    it("should ignore remote sections without URL", async () => {
        const gitConfig = `
[remote "origin"]
    fetch = +refs/heads/*:refs/remotes/origin/*
[remote "upstream"]
    url = https://github.com/upstream/example.git
`;
        (fs.readFile as jest.Mock).mockResolvedValueOnce(gitConfig);

        const result = await parseGitConfig();

        expect(result).toEqual({
            remote: {
                upstream: { url: "https://github.com/upstream/example.git" }
            }
        });
    });

    it("should parse sections with spaces and upper case letters", async () => {
        const gitConfig = `
[   Remote      "origin"]
    url = git@github.com:owner/example.git
[ braNCH    "master"   ]
    remote = origin
    merge = refs/heads/master
`;
        (fs.readFile as jest.Mock).mockResolvedValueOnce(gitConfig);

        const result = await parseGitConfig();

        expect(result).toEqual({
            remote: {
                origin: { url: "git@github.com:owner/example.git" }
            },
            branchNames: ["master"]
        });
    });
});
