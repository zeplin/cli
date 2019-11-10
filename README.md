# Zeplin CLI

## Installation

Install Zeplin CLI using npm.

```
npm install -g @zeplin/cli
```

### Usage

```
zeplin <command> [options]
```

## Connected Components

Placeholder description here.

```
zeplin connect
```

| Options               | Description                                     | Default                 |
|-----------------------|-------------------------------------------------|-------------------------|
| -f, --file <file>     | Full path to components config file             | .zeplin/components.json |
| -d, --dev-mode        | Activate development mode                       | false                   |
| --port <port>         | Optional port number for development mode       | 9756                    |
| -p, --plugin <plugin> | NPM package name of a Zeplin CLI connect plugin |                         |
| -h, --help            | output usage information                        |                         |

#### Examples:

Specify a custom path for components config file.
```
zeplin connect -f path/to/your-components.json
```

You can use multiple config files and multiple plugins at once.
```
zeplin connect -f path/to/components.json -f path/to/other/components.json -p plugin-npm-package-name -p other-plugin-npm-package-name
```

#### Connected Components Plugins

Install connect plugin using npm.

```
npm install -g @zeplin/cli-connect-react-plugin
```

Execute connect command using the plugin.
```
zeplin connect -p @zeplin/cli-connect-react-plugin
```

#### Offical Plugins

| NPM package name                  | Description                                         |
|-----------------------------------|-----------------------------------------------------|
| @zeplin/cli-connect-react-plugin  | Generates snippet samples using React PropTypes     |
| @zeplin/cli-connect-swift-plugin  | Generates snippet using Swift components **(*)**    |
| @zeplin/cli-connect-kotlin-plugin | Generate snippets using Kotlin components **(*)**   |

(*) - Since the language has no popular convention of component like React components, we have defined a sample component for the language.
The plugin is only compatible with this component convention. **Feel free to use these plugins as a base for a custom plugin compatible with your own codebase.**
Check [Custom Plugins](#custom-plugins) below.


#### Custom Plugins

You can develop a custom plugin to extract/generate description and snippets of your code base.

```
npm install --save-dev @zeplin/cli
```

You can find details about plugin development [here](https://github.com/zeplin/cli/blob/develop/PLUGIN.md).
