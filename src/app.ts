#!/usr/bin/env node
import commander from "commander";

import { defaults } from "./config/defaults";
import { bin, version } from "../package.json";
import { connect, ConnectOptions } from "./commands/connect";
import { commandRunner } from "./util/command";

const program = new commander.Command();

function collectionValue(value: string, previous: string[]): string[] {
    // Replace default value
    if (previous.length === 1 && previous[0] === defaults.commands.connect.filePath[0]) {
        return [value];
    }

    return previous.concat([value]);
}

program
    .name(Object.keys(bin)[0])
    .version(version);

console.log(`Zeplin CLI - v${version}\n`);

const connectCommand = program.command("connect");

connectCommand.description("Connect components to code")
    .option("-f, --file <file>", "Full path to components file", collectionValue, defaults.commands.connect.filePath)
    .option("-d, --dev-mode", "Activate development mode", defaults.commands.connect.devMode)
    .option("--port <port>", "Optional port number for development mode", defaults.commands.connect.port)
    .option("-p, --plugin <plugin>", "NPM package name of a Zeplin CLI connect plugin", collectionValue, [])
    .action(commandRunner(async options => {
        const connectOptions: ConnectOptions = {
            configFiles: options.file,
            devMode: options.devMode,
            plugins: options.plugin,
            devModePort: options.port
        };

        await connect(connectOptions);
    }));

program.on("command:*", () => {
    program.outputHelp();
});

program.parse(process.argv);
