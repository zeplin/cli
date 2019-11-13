export const defaults = {
    commands: {
        connect: {
            filePath: [".zeplin/components.json"],
            devMode: false,
            port: 9756
        }
    },
    api: {
        baseURL: process.env.API_BASE_URL || "https://api.zeplin.io",
        clientId: "5d78a9f01b4e9c0a1e9b505b"
    }
};