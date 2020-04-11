import logger from "../src/util/logger";

logger.transports.forEach(transport => (transport.silent = true));
global.console.log = jest.fn();