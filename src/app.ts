#!/usr/bin/env node
import commander from "commander";

import { defaults } from "./config/defaults";
import { bin, version } from "../package.json";
import { connect, ConnectOptions } from "./commands/connect";
import { login } from "./commands/login";
import { commandRunner } from "./util/command";
import { activateVerbose } from "./util/env";

const program = new commander.Command();

function createCollector(): (arg1: string, arg2: string[]) => string[] {
    let cleared = false;

    function collectionValue(value: string, previous: string[]): string[] {
        // Clear default values on first call
        if (!cleared) {
            cleared = true;
            return [value];
        }

        return previous.concat([value]);
    }

    return collectionValue;
}

program
    .name(Object.keys(bin)[0])
    .version(version);

console.log(`\nZeplin CLI - v${version}\n`);

const connectCommand = program.command("connect")
    .description("Connect components to code")
    .option("-f, --file <file>", "Full path to components file", createCollector(), defaults.commands.connect.filePaths)
    .option("-d, --dev", "Activate development mode", defaults.commands.connect.devMode)
    .option("-p, --plugin <plugin>", "npm package name of a Zeplin CLI connect plugin", createCollector(), [])
    .action(commandRunner(async options => {
        const connectOptions: ConnectOptions = {
            configFiles: options.file,
            devMode: options.dev,
            devModePort: defaults.commands.connect.port,
            plugins: options.plugin
        };

        await connect(connectOptions);
    }));

const loginCommand = program.command("login")
    .description("Login to Zeplin")
    .action(commandRunner(login));

// Configure common options
[
    connectCommand,
    loginCommand
].forEach(command => {
    command.option("--verbose", "Enable verbose logs");

    command.on("option:verbose", () => activateVerbose());
});

program.on("command:*", () => {
    program.outputHelp();
});

program.parse(process.argv);
