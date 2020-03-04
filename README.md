# Zeplin CLI

Command-line interface for Zeplin

## Installation

Install Zeplin CLI using npm.

```sh
npm install -g @zeplin/cli
```

## Usage

### Connected Components

[Connected Components](https://zpl.io/connected-components) in Zeplin lets you access components in your codebase directly on designs in Zeplin, with links to Storybook, GitHub and any other source of documentation based on your workflow. 🧩

CLI `connect` command uses plugins to analyze component source code and publishes a high-level overview to be displayed in Zeplin. You can either publish changes to your components manually, or better yet, you can always keep them in sync by running the CLI as a step in your CI workflow.

Make sure that you created a configuration file (`.zeplin/components.json`) following [Connected Components documentation](https://github.com/zeplin/connected-components-docs) and run the `connect` command:

```sh
zeplin connect [options]
```

| Options      | Description                                       | Default                 |
|--------------|---------------------------------------------------|-------------------------|
| -f, --file   | Path to components configuration file             | .zeplin/components.json |
| -d, --dev    | Activate development mode                         | false                   |
| --no-watch   | Disable watching file changes on development mode | false                   |
| -p, --plugin | npm package name of a Zeplin CLI `connect` plugin |                         |
| -h, --help   | Output usage information                          |                         |
| --verbose    | Enable verbose logs                               |                         |

## Plugins

Zeplin CLI commands are extensible using plugins. See [PLUGIN.md](./PLUGIN.md) to build your own plugin.

### Connected Components

`connect` command uses plugins to analyze component source code. Plugins generate component descriptions, code snippets and links for each component.

#### Available plugins

| npm package name                                                                               | Description                                       |
|------------------------------------------------------------------------------------------------|---------------------------------------------------|
| [@zeplin/cli-connect-react-plugin](https://github.com/zeplin/cli-connect-react-plugin)         | Generates snippets from React components          |
| [@zeplin/cli-connect-angular-plugin](https://github.com/zeplin/cli-connect-angular-plugin)     | Generate snippets from Angular components         |
| [@zeplin/cli-connect-swift-plugin](https://github.com/zeplin/cli-connect-swift-plugin)         | Generates snippets from iOS, macOS views in Swift |
| [@zeplin/cli-connect-storybook-plugin](https://github.com/zeplin/cli-connect-storybook-plugin) | Generates Storybook links of components           |

#### Usage

Install a `connect` plugin using npm.

```sh
npm install -g @zeplin/cli-connect-react-plugin
```

Execute `connect` command using the plugin.

```sh
zeplin connect -p @zeplin/cli-connect-react-plugin
```

You can also provide a list of plugins via the `plugins` parameter of the [components configuration file](./docs/cli.componentconfigfile.plugins.md), where it's possible to pass custom parameters to plugins.

### Usage with access token

Zeplin CLI can authenticate using an access token instead of your Zeplin credentials which makes it easier to integrate it into your CI workflow.

1. Get a CLI access token from your [Profile](https://app.zeplin.io/profile/connected-apps) in Zeplin.
2. Set `ZEPLIN_ACCESS_TOKEN` environment variable in your CI.

## Contributing and Issue Tracking

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.
