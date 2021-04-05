import { detectGit } from "../../../src/service/git";
import { BitbucketConfig } from "../../../src/commands/connect/interfaces/config";

describe("DetectGit", () => {
    it("current repository", async () => {
        const detected = await detectGit();

        expect(detected).toBeDefined();
        expect(detected?.config).toBeDefined();
        expect(detected?.config.repository).toBe("zeplin/cli");
        expect(detected?.config.path).toBeUndefined();
        expect(detected?.config.branch).toBeUndefined();
        expect(detected?.config.url).toBeUndefined();
        expect(detected?.type).toBe("github");
    });

    describe("github", () => {
        it("clone over ssh", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/github-ssh.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.config.repository).toBe("owner/example");
            expect(detected?.config.path).toBeUndefined();
            expect(detected?.config.branch).toBeUndefined();
            expect(detected?.config.url).toBeUndefined();
            expect(detected?.type).toBe("github");
        });

        it("clone over http", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/github-http.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.config.repository).toBe("owner/example");
            expect(detected?.config.path).toBeUndefined();
            expect(detected?.config.branch).toBeUndefined();
            expect(detected?.config.url).toBeUndefined();
            expect(detected?.type).toBe("github");
        });

        describe("selfhosted", () => {
            it("clone over http", async () => {
                const detected = await detectGit({
                    path: `${__dirname}/repos/github-selfhosted-http.config`
                });

                expect(detected).toBeDefined();
                expect(detected?.config).toBeDefined();
                expect(detected?.config.repository).toBe("owner/example");
                expect(detected?.config.path).toBeUndefined();
                expect(detected?.config.branch).toBeUndefined();
                expect(detected?.config.url).toBe("https://github.example.com");
                expect(detected?.type).toBe("github");
            });

            it("clone over ssh", async () => {
                const detected = await detectGit({
                    path: `${__dirname}/repos/github-selfhosted-ssh.config`
                });

                expect(detected).toBeDefined();
                expect(detected?.config).toBeDefined();
                expect(detected?.config.repository).toBe("owner/example");
                expect(detected?.config.path).toBeUndefined();
                expect(detected?.config.branch).toBeUndefined();
                expect(detected?.config.url).toBe("https://github.example.com");
                expect(detected?.type).toBe("github");
            });
        });
    });

    describe("gitlab", () => {
        it("clone over ssh", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/gitlab-ssh.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.config.repository).toBe("owner/example");
            expect(detected?.config.path).toBeUndefined();
            expect(detected?.config.branch).toBeUndefined();
            expect(detected?.config.url).toBeUndefined();
            expect(detected?.type).toBe("gitlab");
        });

        it("clone over http", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/gitlab-http.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.config.repository).toBe("owner/example");
            expect(detected?.config.path).toBeUndefined();
            expect(detected?.config.branch).toBeUndefined();
            expect(detected?.config.url).toBeUndefined();
            expect(detected?.type).toBe("gitlab");
        });

        describe("selfhosted", () => {
            it("clone over http", async () => {
                const detected = await detectGit({
                    path: `${__dirname}/repos/gitlab-selfhosted-http.config`
                });

                expect(detected).toBeDefined();
                expect(detected?.config).toBeDefined();
                expect(detected?.config.repository).toBe("owner/example");
                expect(detected?.config.path).toBeUndefined();
                expect(detected?.config.branch).toBeUndefined();
                expect(detected?.config.url).toBe("https://gitlab.example.com");
                expect(detected?.type).toBe("gitlab");
            });

            it("clone over ssh", async () => {
                const detected = await detectGit({
                    path: `${__dirname}/repos/gitlab-selfhosted-ssh.config`
                });

                expect(detected).toBeDefined();
                expect(detected?.config).toBeDefined();
                expect(detected?.config.repository).toBe("owner/example");
                expect(detected?.config.path).toBeUndefined();
                expect(detected?.config.branch).toBeUndefined();
                expect(detected?.config.url).toBe("https://gitlab.example.com");
                expect(detected?.type).toBe("gitlab");
            });
        });
    });

    describe("bitbucket-cloud", () => {
        it("clone over ssh", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/bitbucket-cloud-ssh.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.config.repository).toBe("owner/example");
            expect(detected?.config.path).toBeUndefined();
            expect(detected?.config.branch).toBeUndefined();
            expect(detected?.config.url).toBeUndefined();
            expect(detected?.type).toBe("bitbucket");
        });

        it("clone over http", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/bitbucket-cloud-http.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.config.repository).toBe("owner/example");
            expect(detected?.config.path).toBeUndefined();
            expect(detected?.config.branch).toBeUndefined();
            expect(detected?.config.url).toBeUndefined();
            expect(detected?.type).toBe("bitbucket");
        });
    });

    describe("bitbucket-server", () => {
        it("clone over http", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/bitbucket-server-project-http.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.type).toBe("bitbucket");

            const bitbucketConfig = detected?.config as BitbucketConfig;
            expect(bitbucketConfig.repository).toBe("example");
            expect(bitbucketConfig.path).toBeUndefined();
            expect(bitbucketConfig.branch).toBe("master");
            expect(bitbucketConfig.url).toBe("https://bitbucket.example.com");
            expect(bitbucketConfig.project).toBe("owner");
            expect(bitbucketConfig.user).toBeUndefined();
        });

        it("personal clone over http", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/bitbucket-server-user-http.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.type).toBe("bitbucket");

            const bitbucketConfig = detected?.config as BitbucketConfig;
            expect(bitbucketConfig.repository).toBe("example");
            expect(bitbucketConfig.path).toBeUndefined();
            expect(bitbucketConfig.branch).toBe("master");
            expect(bitbucketConfig.url).toBe("https://bitbucket.example.com");
            expect(bitbucketConfig.project).toBeUndefined();
            expect(bitbucketConfig.user).toBe("~owner");
        });

        it("clone over ssh", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/bitbucket-server-project-ssh.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.type).toBe("bitbucket");

            const bitbucketConfig = detected?.config as BitbucketConfig;
            expect(bitbucketConfig.repository).toBe("example");
            expect(bitbucketConfig.path).toBeUndefined();
            expect(bitbucketConfig.branch).toBe("master");
            expect(bitbucketConfig.url).toBe("https://bitbucket.example.com");
            expect(bitbucketConfig.project).toBe("owner");
            expect(bitbucketConfig.user).toBeUndefined();
        });

        it("personal clone over http", async () => {
            const detected = await detectGit({
                path: `${__dirname}/repos/bitbucket-server-user-ssh.config`
            });

            expect(detected).toBeDefined();
            expect(detected?.config).toBeDefined();
            expect(detected?.type).toBe("bitbucket");

            const bitbucketConfig = detected?.config as BitbucketConfig;
            expect(bitbucketConfig.repository).toBe("example");
            expect(bitbucketConfig.path).toBeUndefined();
            expect(bitbucketConfig.branch).toBe("master");
            expect(bitbucketConfig.url).toBe("https://bitbucket.example.com");
            expect(bitbucketConfig.project).toBeUndefined();
            expect(bitbucketConfig.user).toBe("~owner");
        });
    });

    // it("bitbucket-server project repository", async () => {
    //     const detected = await detectGit({
    //         path: `${__dirname}/repos/bitbucket-server-project.config`
    //     });

    //     expect(detected).toBeDefined();
    //     expect(detected?.config).toBeDefined();
    //     expect(detected?.type).toBe("bitbucket");

    //     const bitbucketConfig = detected.config as BitbucketConfig;
    //     expect(bitbucketConfig.repository).toBe("owner/example");
    //     expect(bitbucketConfig.path).toBeUndefined();
    //     expect(bitbucketConfig.branch).toBeUndefined();
    //     expect(bitbucketConfig.url).toBeUndefined();
    //     expect(bitbucketConfig.project).toBeUndefined();
    //     expect(bitbucketConfig.user).toBeUndefined();
    // });
});