# Contributing

Firstly, thank you for considering contributing to Zeplin CLI. ✌️

We welcome any type of contribution, not only code. You can help by:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Improving documentation

## Issue tracking

We use GitHub issues to track public bugs, feature requests and suggestions. [Open a new issue.](https://github.com/zeplin/cli/issues/new)

☝️ *Please review your bug reports before posting to remove or mask any private/sensitive information.*

For each bug report, try an include the following information:

- A quick summary and/or background
- What you expected would happen
- What actually happens
- Steps to reproduce
  - Be specific
  - Share sample text output/screenshot/screencastcast if possible
  - Share configuration file and/or log file located in `~/.zeplin` directory *(Mask any private/sensitive information.)*

## Your first contribution

We use [GitHub Flow](https://guides.github.com/introduction/flow/index.html), all code changes happen through pull requests.

- Fork the repo and create a branch from `master`.
- If you've added code that should be tested, add tests.
- If you've changed APIs, update the documentation.
- Ensure the test suite passes by running `npm test`.
- Make sure your code lints by running `npm run lint`.
  - We use [ESLint](https://eslint.org), [husky](https://github.com/typicode/husky) is configured to run `npm run lint` as a pre-commit hook for convenience.
- Open a pull request.

## License

By contributing, you agree that your contributions will be licensed under its [MIT License](http://choosealicense.com/licenses/mit/).

## References

This document was adapted from an open source contribution document gist shared by [braindk](https://gist.github.com/briandk/3d2e8b3ec8daf5a27a62).
