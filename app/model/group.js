"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connect_1 = require("../connect");
const image_1 = require("./image");
class Group extends connect_1.bookshelf.Model {
    constructor() {
        super(...arguments);
        this.hasTimestamps = true;
    }
    get tableName() {
        return 'groups';
    }
    images() {
        return this.hasMany(image_1.default);
    }
}
exports.default = Group;
//# sourceMappingURL=group.js.map