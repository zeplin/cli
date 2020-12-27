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
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    plugins: ["@typescript-eslint"],
    settings: {
        "import/resolver": {
            typescript: { directory: "./tsconfig.json" },
        }
    },
    rules: {
        "capitalized-comments": "off",
        "arrow-body-style": ["error", "as-needed"],
        "no-sync": "off",
        "no-process-exit": "off",
        "no-process-env": "off",
        "no-undefined": "off",
        "@typescript-eslint/no-explicit-any": ["error", { "ignoreRestArgs": true }],
        "@typescript-eslint/camelcase": ["error", { "properties": "never", "ignoreDestructuring": true }],
        "class-methods-use-this": "off"
    },
    overrides: [
        {
            files: [
                "test/**/*"
            ],
            rules: {
                "no-magic-numbers": "off"
            }
        }
    ]
}
