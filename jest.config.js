module.exports = {
    roots: [
        "<rootDir>/src",
        "<rootDir>/test"
    ],
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
    moduleNameMapper: {
        axios: "axios/dist/node/axios.cjs"
    }
};