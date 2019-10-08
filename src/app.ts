import commander from "commander";

import { defaults } from "./config/defaults";
import { bin, version } from "../package.json";
import { link, LinkOptions } from "./commands/link";
import { commandRunner } from "./util/command";

console.log(`Zeplin CLI - v${version}\n`);

const program = new commander.Command();

function collectionValue(value: string, previous: string[]): string[] {
    return previous.concat([value]);
}

program
    .name(Object.keys(bin)[0])
    .version(version);

program
    .command("link")
    .description("Link components to code")
    .option("-f, --file <file>", "Full path to components config file", collectionValue, [])
    .option("-d, --dev-mode", "Activate development mode", defaults.commands.link.devMode)
    .option("-p, --plugin <plugin>", "NPM package name of a processor plugin", collectionValue, [])
    .action(commandRunner(async options => {
        const linkOptions: LinkOptions = {
            configFiles: options.file,
            devMode: options.devMode,
            workingDirectory: process.cwd(),
            plugins: options.plugin
        };

        await link(linkOptions);
    }));

program.on("command:*", () => {
    program.outputHelp();
});

program.parse(process.argv);
