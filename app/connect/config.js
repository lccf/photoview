"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.dbConfig = {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: path.resolve(__dirname, "../../data/db/development.sqlite3")
    }
};
//# sourceMappingURL=config.js.map