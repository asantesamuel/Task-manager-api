"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("prisma/config");
exports.default = (0, config_1.defineConfig)({
    schema: 'prisma/schema.prisma',
    datasource: {
        // We add a fallback or ensure the variable is pulled correctly
        url: 'postgresql://postgres:admin@localhost:3000/url_shortener',
    },
});
