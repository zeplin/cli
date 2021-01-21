#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const debug = require("debug")("@zeplin/cli");
const importLocal = require("import-local");

if (importLocal(__filename)) {
    debug("Using local install of @zeplin/cli");
} else {
    require("../dist/src/cli");
}
