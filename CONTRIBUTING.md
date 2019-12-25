# Contributing to Zeplin CLI
Thank you for considering contributing to this project! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Improving documentation

## Issue Tracking
We use GitHub issues to track public bugs, feature requests and suggestions.

💁‍♀️[Open a new issue from here](https://github.com/zeplin/cli/issues/new).

### ⚠️ **Please review your bug reports before posting to remove or mask any private/sensitive information regarding to your project.**

We would be very happy if your bug report contains the following:

- A quick summary and/or background
- What you expected would happen
- What actually happens
- Steps to reproduce
  - Be specific
  - Share sample text output/screenshot/videocast if you can
  - Share configuration file and/or log file (located in ~/.zeplin directory)
  - **Don't forget to remove or mask any private/sensitive information.**
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Contribution Workflow

We use [GitHub Flow](https://guides.github.com/introduction/flow/index.html) for external contributions, all code changes happen through pull requests. We actively welcome your pull requests:

1. Fork the repo and create your branch from `develop`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
    - We use jest as testing suite, run `npm test` to test the package
5. Make sure your code lints
6. Create your PR into `develop` branch

## Code Style
We use ESLint as linter. Please ensure that commits on your PR  adhere to ESLint rules. Suggestions are welcome to include/exclude rules on ESLint configuration. [husky](https://github.com/typicode/husky) is configured to run `npm run lint` as pre-commit hook for convenience.

## License
By contributing, you agree that your contributions will be licensed under its [MIT License](http://choosealicense.com/licenses/mit/).

## References
This document was adapted from an open source contribution document gist shared by [braindk](https://gist.github.com/briandk/3d2e8b3ec8daf5a27a62).
