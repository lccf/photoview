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
const url = require("url");
const cheerio = require("cheerio");
const net_1 = require("./net");
const model_1 = require("./model");
var fetchPageModel;
(function (fetchPageModel) {
    fetchPageModel[fetchPageModel["nextPage"] = 0] = "nextPage";
})(fetchPageModel || (fetchPageModel = {}));
class Capture {
    constructor() {
        // public url: string = 'http://www.zcool.com.cn/work/ZMTkxNTgxNjA=.html'
        this.url = 'http://www.zcool.com.cn/work/ZMTk1NDU2MjQ=.html';
        this.refererUrl = 'http://www.zcool.com.cn/works/33!0!!0!0!200!1!1!!!/';
        this.pageHtml = '';
        this.pageModel = fetchPageModel.nextPage;
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
    parseNextPageUrl(html, pageUrl) {
        let $nextPage = cheerio('.laypage_next', html);
        let nextPageUrl = '';
        debugger;
        if ($nextPage.length) {
            nextPageUrl = url.resolve(this.url, $nextPage.attr('href'));
            this.startByUrl(nextPageUrl, pageUrl, true);
        }
        else {
            net_1.FetchPageQueue.getInstance().complete();
        }
    }
    parsePageImageByHtml(html) {
        return __awaiter(this, void 0, void 0, function* () {
            let imageUrls = [];
            let imageIdMatch = this.url.match(/work\/([^=]+)/);
            let imageId = 'image_id_' + (new Date());
            if (imageIdMatch != null) {
                imageId = imageIdMatch[1];
            }
            let $imgs = cheerio('.light-slide-content', html);
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
    parsePageImageByUrl(pageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let html = yield this.getHtml(pageUrl);
            return this.parsePageImageByHtml(html);
        });
    }
    downloadImageByPageHtml(html) {
        return __awaiter(this, void 0, void 0, function* () {
            let images = yield this.parsePageImageByHtml(html);
            try {
                fs.accessSync(`./data`);
            }
            catch (e) {
                fs.mkdirSync(`./data`);
            }
            try {
                fs.accessSync(`./data/${images[0].imageId}`);
            }
            catch (e) {
                fs.mkdirSync(`./data/${images[0].imageId}`);
            }
            let downloadQueue = net_1.DownloadQueue.getInstance();
            let allTask = [];
            for (let img of images) {
                let imageId = img.imageId;
                let imageUrl = img.origin || img.img;
                let refererUrl = this.url;
                allTask.push(new Promise(resolve => {
                    downloadQueue.addQueue({ imageId, imageUrl, refererUrl }, function (state, data) {
                        console.log(data);
                        resolve(data);
                    });
                }));
            }
            return new Promise(resolve => Promise.all(allTask).then(data => resolve('success')));
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
    downloadAllPageImage() {
        return __awaiter(this, void 0, void 0, function* () {
            let images = yield this.parseAllPageImage();
            try {
                fs.accessSync(`./data`);
            }
            catch (e) {
                fs.mkdirSync(`./data`);
            }
            try {
                fs.accessSync(`./data/${images[0].imageId}`);
            }
            catch (e) {
                fs.mkdirSync(`./data/${images[0].imageId}`);
            }
            let downloadQueue = net_1.DownloadQueue.getInstance();
            let allTask = [];
            for (let img of images) {
                let imageId = img.imageId;
                let imageUrl = img.origin || img.img;
                let refererUrl = this.url;
                allTask.push(new Promise(resolve => {
                    downloadQueue.addQueue({ imageId, imageUrl, refererUrl }, function (state, data) {
                        console.log(data);
                        resolve(data);
                    });
                }));
            }
            return new Promise(resolve => Promise.all(allTask).then(data => resolve('success')));
        });
    }
    parsePageInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let html = yield this.getHtml();
            let $html = cheerio.load(html).root();
            let author = $html.find('.userName').eq(0).find('a').text().replace(/^\s*|\s*$/g, '');
            let title = $html.find('.workTitle').text().replace(/^\s*|原创作品：|\s*$/g, '');
            let desc = $html.find('.workInfor').html().replace(/^\s*|\s*$/g, '');
            return new Promise(resolve => resolve({ title, author, desc, url: this.url }));
        });
    }
    startByUrl(pageUrl, refererUrl, isChild) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refererUrl) {
                refererUrl = pageUrl;
            }
            this.url = pageUrl;
            this.refererUrl = refererUrl;
            let pageQueue = net_1.FetchPageQueue.getInstance();
            let param = {
                pageUrl,
                refererUrl
            };
            let _self = this;
            if (!isChild) {
                return new Promise(resolve => {
                    pageQueue.subscribe({
                        next: function () {
                            console.log('pageQueue next');
                        },
                        complete: function () {
                            debugger;
                            resolve('download success!');
                        }
                    });
                    pageQueue.addQueue({ pageUrl, refererUrl }, (state, data) => {
                        _self.downloadImageByPageHtml(data).then(console.log);
                        _self.parseNextPageUrl(data, _self.url);
                    });
                });
            }
            else {
                pageQueue.addQueue({ pageUrl, refererUrl }, (state, data) => {
                    _self.downloadImageByPageHtml(data).then(console.log);
                    _self.parseNextPageUrl(data, _self.url);
                });
            }
        });
    }
    hasGroup() {
        let url = this.url;
        model_1.Group.where({ url }).fetch().then(group => {
            console.log(JSON.stringify(group));
        }).catch(err => {
            console.log(err);
        });
    }
    addGroup() {
        let group = new model_1.Group({
            title: '海岸',
            author: ' 宏贇同學',
            url: 'http://www.zcool.com.cn/work/ZMTk1NDU2MjQ=.html',
            desc: 'contax t2'
        });
        group.save().then(function (model) {
            console.log('success');
        }).catch(function (err) {
            console.log(err);
        });
    }
}
exports.Capture = Capture;
exports.test = () => {
    let capture = new Capture();
    // capture.parsePageImage('http://www.zcool.com.cn/work/ZMTk0MTY1NDA=.html');
    // capture.parsePageImage('http://www.zcool.com.cn/work/ZMTk1ODk0Njg=.html');
    // capture.parsePageImage('http://www.zcool.com.cn/work/ZMTk0ODUwMDQ=/2.html');
    // capture.hasGroup();
    // capture.parseAllPageUrl().then(urls => console.log(urls));
    // capture.parseAllPageImage().then(imageUrls => console.log(imageUrls));
    capture.downloadAllPageImage().then(data => console.log(data));
    // capture.parsePageInfo().then(pageInfo => console.log(pageInfo));
    // capture.addGroup();
};
class Download {
    download(pageUrl, refererUrl) {
        let capture = new Capture();
        capture.startByUrl(pageUrl, refererUrl).then(msg => console.log);
    }
    render() {
        let html = `
      <div>
        <h2>组图下载</h2>
        <p>组图地址: <input style="width: 400px;" type="text" id="pageUrl" value="http://www.zcool.com.cn/work/ZMjIxMTI0MDg=.html" />
        <p>引用地址: <input style="width: 400px;" type="text" id="refererUrl" value="http://www.zcool.com.cn/discover/33!0!0!0!0!!!!2!-1!1" />
        <p><button type="button">download</button>
        <div id="downloadInfo"></div>
      </div>
    `;
        document.querySelector('#app').innerHTML = html;
        this.bindEvent();
        // let subject = new Subject<string>();
        // subject.subscribe({
        //   next: v => console.log(v),
        //   complete: () => console.log('complete');
        // });
        // subject.next('a');
        // subject.next('b');
        // subject.complete();
    }
    bindEvent() {
        // let $el = $('#app');
        let btn = document.querySelector('#app button');
        let _self = this;
        btn.addEventListener('click', function () {
            let pageUrl = document.querySelector('#pageUrl').value;
            let refererUrl = document.querySelector('#refererUrl').value;
            if (pageUrl != '') {
                _self.download(pageUrl, refererUrl);
            }
        });
        // $el.find('button').on('click', function() {
        //   let pageUrl = trim($('#pageUrl').val());
        //   let refererUrl = trim($('#refererUrl').val());
        //   if (pageUrl != '') {
        //     this.download(pageUrl, refererUrl);
        //   }
        // });
    }
}
exports.Download = Download;
//# sourceMappingURL=download.js.map