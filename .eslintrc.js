module.exports = {
    env: {
        node: true,
    },
    extends: [
        "@zeplin/eslint-config/node",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/recommended"
    ],
    parser: '@typescript-eslint/parser',
    parserOptions:  {
        'project': './tsconfig.json'
      },
    plugins: ['@typescript-eslint'],
    rules: {
        "capitalized-comments": "error",
        "arrow-body-style": ["error", "as-needed"],
    }
};
