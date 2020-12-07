import { LinkType } from "../commands/connect/interfaces/plugin";

export const defaults = {
    commands: {
        connect: {
            filePaths: [],
            ciMode: false,
            devMode: false,
            devModeWatch: true,
            port: 9756
        }
    },
    api: {
        baseURL: process.env.API_BASE_URL || "https://api.zeplin.io",
        clientId: process.env.API_CLIENT_ID || "5dd27af376f8bf5094f6ebe6"
    },
    github: {
        url: "https://github.com",
        branch: "master",
        prefix: "/blob/",
        type: LinkType.github
    },
    gitlab: {
        url: "https://gitlab.com",
        branch: "master",
        prefix: "/blob/",
        type: LinkType.gitlab
    },
    bitbucket: {
        url: "https://bitbucket.org",
        cloudPrefix: "/src/",
        type: LinkType.bitbucket
    }
};