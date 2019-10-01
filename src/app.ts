import commander from "commander";

import defaults from "./config/defaults";
import { bin, version } from "../package.json";
import { LinkOptions } from "./commands/link";
import { commandRunner } from "./util/command";

console.log(`Zeplin CLI - v${version}\n`);

const program = new commander.Command();

program
    .name(Object.keys(bin)[0])
    .version(version);

program
    .command("link")
    .description("Link components to code")
    .option("-f, --file <file>", "Full path to components config file", defaults.link.filePath)
    .option("-d, --dev-mode", "Activate development mode", defaults.link.devMode)
    .action(commandRunner(async options => {
        const { link } = await import("./commands/link");

        const linkOptions: LinkOptions = {
            configFile: options.file,
            devMode: options.devMode,
            workingDirectory: process.cwd()
        };

        link(linkOptions);
    }));

program.on("command:*", () => {
    program.outputHelp();
});

program.parse(process.argv);
