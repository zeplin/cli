#!/usr/bin/env node
import commander from "commander";
import updateNotifier from "update-notifier";

import { defaults } from "./config/defaults";
import { bin, name, version } from "../package.json";
import { connect, connectDelete, ConnectDeleteOptions, ConnectOptions } from "./commands/connect";
import { login } from "./commands/login";
import { commandRunner } from "./util/command";
import { activateCI, activateVerbose } from "./util/env";
import logger from "./util/logger";

function beforeCommand(): void {
    const un = updateNotifier({
        pkg: {
            name,
            version
        },
        updateCheckInterval: 0,
        shouldNotifyInNpmScript: true
    });
    un.notify();
}

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

const program = new commander.Command();

program
    .name(Object.keys(bin)[0])
    .version(version);

logger.info(`\nZeplin CLI - v${version}\n`);

const connectCommand = program.command("connect")
    .description("Connect components to code")
    .option("-f, --file <file>", "Full path to components file", createCollector(), defaults.commands.connect.filePaths)
    .option("-d, --dev", "Activate development mode", defaults.commands.connect.devMode)
    .option("--no-watch", "Disable watch files on development mode", defaults.commands.connect.devModeWatch)
    .option("-p, --plugin <plugin>", "npm package name of a Zeplin CLI connect plugin", createCollector(), [])
    .action(commandRunner(async options => {
        const connectOptions: ConnectOptions = {
            configFiles: options.file,
            devMode: options.dev,
            devModePort: defaults.commands.connect.port,
            devModeWatch: options.watch,
            plugins: options.plugin
        };

        await connect(connectOptions);
    }));

connectCommand.command("delete")
    .description("Delete component connections from Zeplin")
    .option("-f, --file <file>", "Full path to components file", createCollector(), defaults.commands.connect.filePaths)
    .action(commandRunner(async options => {
        const connectDeleteOptions: ConnectDeleteOptions = {
            configFiles: options.file
        };

        await connectDelete(connectDeleteOptions);
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
    command.option("--ci", "Enforce CI mode (no prompts)");

    command.on("option:verbose", () => activateVerbose());
    command.on("option:ci", () => activateCI());
});

program.on("command:*", () => {
    program.outputHelp();
});

beforeCommand();
program.parseAsync(process.argv);
