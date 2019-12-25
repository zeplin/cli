# Connected Components - Plugin Development

You can easily develop a plugin for your custom needs to connect your components into Zeplin.

Plugins can process the components to generate descriptions and snippets of them and also create links to other tools(e.g. wiki page, design system).

## Implementation

 - Create a class that implements [ConnectPlugin](./src/commands/connect/interfaces/plugin.d.ts).
 - Export the class as a default export in your package entry point
 - Publish to NPM and start to use it as explained in [README.md](./README.md#plugin-usage)

 If you want to have type definitions for plugin development install `@zeplin/cli` package as dev dependency.
```
npm install --save-dev @zeplin/cli
```

Please refer to the example below and [interface documentation](./docs/cli.connectplugin.md) for details.

### Example of `index.ts`
```typescript
import { ConnectPlugin, ComponentConfig, ComponentData, PrismLang } from "@zeplin/cli";

export default class implements ConnectPlugin {

    /**
     * CLI invokes this method once the package is loaded.
     * pluginContext contains arbitrary configuration set for the plugin
     * on components config file.
     *
     * This method is optional. Implement it to initialize plugin locals etc.
     * based on plugin configuration.
    */
    async init(pluginContext: PluginContext): Promise<void> {
        // implementation
    }


    /**
     * CLI invokes this method for each component in the configration file.
    */
    async process(context: ComponentConfig): Promise<ComponentData> {
        // implementation
    }

    /**
     * CLI invokes this method for each component in the configuration file
     * to determine if this plugin should process this component.
    */
    supports(context: ComponentConfig): boolean {
        // implementation
    }
}