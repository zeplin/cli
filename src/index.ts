import * as commands from "./commands";

export {
    commands
};

/*
import { LoginAuthServer } from "./commands/login/server";

const server = new LoginAuthServer("/authorize");

async function run() {
    const token = await server.waitForToken({ port: 8080 });
    console.log(token);
}

run();
*/