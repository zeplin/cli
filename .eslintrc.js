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
        ecmaVersion: 2018,
        sourceType: "module"
    },
    plugins: ["@typescript-eslint"],
    settings: {
        "import/resolver": {
            typescript: { directory: "./tsconfig.json" }
        }
    },
    rules: {
        "capitalized-comments": "off",
        "arrow-body-style": ["error", "as-needed"],
        "no-sync": "off",
        "no-process-exit": "off",
        "no-process-env": "off",
        "no-undefined": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/camelcase": "off",
        "class-methods-use-this": "off",
        "@typescript-eslint/no-empty-function": "off",
        "no-use-before-define": "warn",
        "no-shadow": "warn",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/ban-types": "off"
    },
    overrides: [
        {
            files: [
                "test/**/*"
            ],
            rules: {
                "no-magic-numbers": "off"
            }
        },
        {
            files: [
                "src/tasks/**/*"
            ],
            rules: {
                "require-atomic-updates": "off"
            }
        }
    ]
};
