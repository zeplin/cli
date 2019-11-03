export const defaults = {
    commands: {
        link: {
            filePath: ".zeplin/components.json",
            devMode: false,
            port: 9756
        }
    },
    api: {
        baseURL: process.env.API_BASE_URL || "https://api.zeplin.io"
    }
};