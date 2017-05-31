"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Knex = require("knex");
const config_1 = require("./config");
exports.default = Knex(config_1.dbConfig);
//# sourceMappingURL=knex.js.map