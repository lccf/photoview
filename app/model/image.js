"use strict";
const connect_1 = require("../connect");
const group_1 = require("./group");
class Image extends connect_1.bookshelf.Model {
    constructor() {
        super(...arguments);
        this.hasTimestamps = true;
    }
    get tableName() {
        return 'images';
    }
    group() {
        return this.belongsTo(group_1.default);
    }
}
Image.small = 1;
Image.large = 2;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Image;
//# sourceMappingURL=image.js.map