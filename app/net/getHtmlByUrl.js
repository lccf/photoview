"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Request = require("request");
/**
 * 获取页面html
 */
exports.getHtmlByUrl = function (requestUrl, refererUrl = '') {
    return __awaiter(this, void 0, void 0, function* () {
        if (refererUrl == '') {
            refererUrl = requestUrl;
        }
        let requestOptions = {
            url: requestUrl,
            headers: {
                "Referer": refererUrl
            }
        };
        return new Promise(resolve => {
            Request(requestOptions, (error, response, body) => resolve(body));
        });
    });
};
//# sourceMappingURL=getHtmlByUrl.js.map