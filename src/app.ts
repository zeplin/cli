import commander from "commander";
import { bin, version } from "../package.json";

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

program.on("command:*", () => {
    program.outputHelp();
});

program.parse(process.argv);
