"use strict";
const fs = require("fs");
const path = require("path");
exports.existSync = path => {
    try {
        fs.accessSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.mkdirs = (filePath) => {
    filePath = path.resolve(filePath);
    let temp = filePath;
    let { root } = path.parse(filePath);
    let dirs = [];
    while (temp != root) {
        dirs.push(temp);
        temp = path.dirname(temp);
    }
    while (dirs.length) {
        temp = dirs.pop();
        if (!exports.existSync(temp)) {
            fs.mkdirSync(temp);
        }
    }
};
exports.trim = (str) => {
    return str.replace(/^\s+|\s+$/g, '');
};
//# sourceMappingURL=index.js.map