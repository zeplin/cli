# Plugins

Zeplin CLI commands are extensible using plugins.

## Connected Components

To extend the `connect` command, you can build a plugin for your own needs. Plugins process components to generate descriptions, code snippets and links (e.g. internal wiki, design system).

### Implementation

1. Create a class that implements the [ConnectPlugin](./src/commands/connect/interfaces/plugin.d.ts) interface.
    - See [interface documentation](./docs/cli.connectplugin.md) for details.
    - To get type definitions for plugin development install `@zeplin/cli` package as a development dependency.

        ```sh
        npm install --save-dev @zeplin/cli
        ```

2. Export the class as a default export in your [package entry point](https://docs.npmjs.com/files/package.json#main).
3. Test the plugin:
    - Install your plugin globally.

        ```sh
        cd ~/path/to/your/plugin/project
        npm install -g
        ```

    - Execute `connect` command.
4. *(Optional)* Publish the plugin to npm.
    - If you prefer not to publish the plugin, it should still work as long as `@zeplin/cli` package can require/import your package in its own node context.
5. *(Optional)* Add your plugin to [Available plugins](./README.md#available-plugins).
    - Create a pull request to add your plugin to the available plugins list.

### Examples

Here's a boilerplate for a class that implements the [ConnectPlugin](./src/commands/connect/interfaces/plugin.d.ts) interface.

```typescript
import { ConnectPlugin, ComponentConfig, ComponentData, PrismLang } from "@zeplin/cli";

export default class implements ConnectPlugin {

    /**
     * CLI invokes this method once the package is loaded.
     * pluginContext contains custom parameters defined in the configuration
     * file.
     *
     * This method is optional, implement it to initialize plugin locals and
     * so on.
    */
    async init(pluginContext: PluginContext): Promise<void> {

    }

    /**
     * CLI invokes this method for each component in the configuration file.
    */
    async process(context: ComponentConfig): Promise<ComponentData> {

    }

    /**
     * CLI invokes this method for each component in the configuration file
     * to determine if the plugin should process the component.
    */
    supports(context: ComponentConfig): boolean {

    }
}
```

You can also check out these open-source Connected Components plugins to see how they work.

| npm package name                                                                              | Description                                       |
|-----------------------------------------------------------------------------------------------|---------------------------------------------------|
| [zeplin/cli-connect-react-plugin](https://github.com/zeplin/cli-connect-react-plugin)         | Generates snippets from React components          |
| [zeplin/cli-connect-angular-plugin](https://github.com/zeplin/cli-connect-angular-plugin)     | Generate snippets from Angular components         |
| [zeplin/cli-connect-swift-plugin](https://github.com/zeplin/cli-connect-swift-plugin)         | Generates snippets from iOS, macOS views in Swift |
| [zeplin/cli-connect-storybook-plugin](https://github.com/zeplin/cli-connect-storybook-plugin) | Generates Storybook links of components           |
