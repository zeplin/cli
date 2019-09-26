export const defaults = {
    commands: {
        link: {
            filePath: ".zeplin/components.json",
            devMode: false
        }
    },
    api: {
        baseURL: process.env.API_BASE_URL || "https://api.zeplin.io"
    }
};