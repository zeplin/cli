#!/usr/bin/env node
import commander from "commander";

import { defaults } from "./config/defaults";
import { bin, version } from "../package.json";
import { link, LinkOptions } from "./commands/link";
import { commandRunner } from "./util/command";

const program = new commander.Command();

function collectionValue(value: string, previous: string[]): string[] {
    return previous.concat([value]);
}

program
    .name(Object.keys(bin)[0])
    .version(version);

console.log(`Zeplin CLI - v${version}\n'`);

const linkCommand = program.command("link");

linkCommand.description("Link components to code")
    .option("-f, --file <file>", "Full path to components config file", collectionValue, [])
    .option("-d, --dev-mode", "Activate development mode", defaults.commands.link.devMode)
    .option("--port <port>", "Optional port number for development mode", defaults.commands.link.port)
    .option("-p, --plugin <plugin>", "NPM package name of a Zeplin CLI link plugin", collectionValue, [])
    .action(commandRunner(async options => {
        if (options.file.length === 0) {
            console.error("Hey hey! We need a component config file to connect components!");

            linkCommand.outputHelp();
        } else {
            const linkOptions: LinkOptions = {
                configFiles: options.file,
                devMode: options.devMode,
                plugins: options.plugin,
                devModePort: options.port
            };

            await link(linkOptions);
        }
    }));

program.on("command:*", () => {
    program.outputHelp();
});

program.parse(process.argv);
