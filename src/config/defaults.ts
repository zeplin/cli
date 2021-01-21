import { LinkType } from "../commands/connect/interfaces/plugin";

export const defaults = {
    commands: {
        connect: {
            filePaths: [],
            devMode: false,
            devModeWatch: true,
            port: 9756
        },
        login: {
            noBrowser: false,
            port: 9757
        },
        initialize: {
            filePath: ".zeplin/components.json"
        }
    },
    api: {
        baseURL: process.env.API_BASE_URL || "https://api.zeplin.io",
        clientId: process.env.API_CLIENT_ID || "5dd27af376f8bf5094f6ebe6"
    },
    app: {
        webURL: process.env.WEB_URL || "https://app.zeplin.io",
        authRedirectPath: process.env.AUTH_REDIRECT_PATH || "/authorize",
        webAuthRedirectURL: process.env.WEB_AUTH_REDIRECT_URI || "https://app.zeplin.io/cliAuthorized"
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
