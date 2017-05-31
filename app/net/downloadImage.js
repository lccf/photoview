"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Request = require("request");
const config_1 = require("../config");
/**
 * 下载图片
 */
exports.downloadImage = function (param) {
    return __awaiter(this, void 0, void 0, function* () {
        let { imageId, imageUrl, refererUrl } = param;
        let requestOptions = {
            url: imageUrl,
            headers: {
                "Referer": refererUrl
            }
        };
        let imgName = imageUrl.match(/\/([^\/]*)$/)[1];
        return new Promise(function (resolve, reject) {
            try {
                fs.accessSync(`${config_1.imageDir}/${imageId}/${imgName}`);
                resolve(`file ${imageUrl} downloaded`);
                // console.log(`file ${imageUrl} downloaded`);
            }
            catch (e) {
                try {
                    let ws = Request(requestOptions).pipe(fs.createWriteStream(`${config_1.imageDir}/${imageId}/${imgName}`));
                    ws.on('finish', () => {
                        resolve(`download ${imageUrl} success!`);
                    });
                }
                catch (err) {
                    reject(err);
                }
            }
        });
    });
};
//# sourceMappingURL=downloadImage.js.map