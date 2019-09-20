import commander from "commander";

import { bin, version } from "../package.json";
import { LinkOptions } from "./commands/link";

import defaults from "./config/defaults";

const program = new commander.Command();

program
    .name(Object.keys(bin)[0])
    .version(version);

program
    .command("hello <text>")
    .description("All your base are belong to us.")
    .action(async text => {
        const { Hello } = await import("./commands/hello");

        new Hello(text).hello();
    });

program
    .command("link")
    .description("Link components to code")
    .option("-f, --file <file>", "Full path to components config file", defaults.link.filePath)
    .option("-d, --dev-mode", "Activate development mode", defaults.link.devMode)
    .action(async options => {
        const { link } = await import("./commands/link");

        const linkOptions: LinkOptions = { file: options.file, devMode: options.devMode };

        link(linkOptions);
    });

program.on("command:*", () => {
    program.outputHelp();
});

program.parse(process.argv);
