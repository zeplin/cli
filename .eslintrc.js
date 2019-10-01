module.exports = {
    env: {
        node: true,
        jest: true
    },
    extends: [
        "@zeplin/eslint-config/node",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/recommended"
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        'project': './tsconfig.json'
    },
    plugins: ['@typescript-eslint'],
    rules: {
        "capitalized-comments": "error",
        "arrow-body-style": ["error", "as-needed"],
        "no-sync": "off",
        "no-process-exit": "off",
        "no-process-env": "off",
        "@typescript-eslint/no-explicit-any": ["error", { "ignoreRestArgs": true }]
    }
};
