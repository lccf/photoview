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
const url = require("url");
const cheerio = require("cheerio");
const net_1 = require("../net");
class ParseUrl {
    constructor(url, refererUrl = '') {
        this.url = url;
        this.refererUrl = refererUrl;
        this.pageHtml = '';
    }
    getHtml(pageUrl = '') {
        return __awaiter(this, void 0, void 0, function* () {
            let saveHtml = false;
            let pageHtml = '';
            if (!pageUrl) {
                pageUrl = this.url;
                saveHtml = true;
                pageHtml = this.pageHtml;
            }
            if (!pageHtml) {
                pageHtml = yield net_1.getHtmlByUrl(pageUrl, this.refererUrl);
                if (saveHtml) {
                    this.pageHtml = pageHtml;
                }
            }
            return new Promise(resolve => resolve(pageHtml));
        });
    }
    parsePageInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let html = yield this.getHtml();
            let $html = cheerio.load(html).root();
            debugger;
            let author = $html.find('.userName').eq(0).find('a').text().replace(/^\s*|\s*$/g, '');
            let title = $html.find('.workTitle').text().replace(/^\s*|原创作品：|\s*$/g, '');
            let desc = $html.find('.workInfor').html().replace(/^\s*|\s*$/g, '');
            return new Promise(resolve => resolve({ title, author, desc, url: this.url }));
        });
    }
    parsePageImageByUrl(pageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let imageUrls = [];
            let imageIdMatch = this.url.match(/work\/([^=]+)/);
            let imageId = 'image_id_' + (new Date());
            if (imageIdMatch != null) {
                imageId = imageIdMatch[1];
            }
            let html = yield this.getHtml(pageUrl);
            let $imgs = cheerio('.workShow li', html);
            $imgs.each((index, img) => {
                let $img = cheerio(img);
                let $imgLink = $img.find('.image-link');
                let originUrl = '';
                if ($imgLink.length) {
                    originUrl = $imgLink.attr('href').split('=')[1];
                }
                imageUrls.push({
                    imageId: imageId,
                    img: $img.find('img').attr('src'),
                    origin: originUrl
                });
            });
            return new Promise(resolve => resolve(imageUrls));
        });
    }
    parseAllPageUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            let html = yield this.getHtml();
            let $pages = cheerio('.workShow .bigPage a', html);
            let urls = [this.url];
            $pages.each((index, tag) => {
                let $tag = cheerio(tag);
                if ($tag.length && !$tag.attr('class') && $tag.attr('href')
                    && $tag.attr('href').match(/^\/work.*\.html$/) != null) {
                    urls.push(url.resolve(this.url, $tag.attr('href')));
                }
            });
            return new Promise(resolve => resolve(urls));
        });
    }
    parseAllPageImage() {
        return __awaiter(this, void 0, void 0, function* () {
            let urls = yield this.parseAllPageUrl();
            let images = [];
            for (let pageUrl of urls) {
                let pageImages = yield this.parsePageImageByUrl(pageUrl);
                images = images.concat(pageImages);
            }
            return new Promise(resolve => resolve(images));
        });
    }
}
exports.ParseUrl = ParseUrl;
//# sourceMappingURL=index.js.map