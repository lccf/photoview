"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basicQueue_1 = require("./basicQueue");
const getHtmlByUrl_1 = require("./getHtmlByUrl");
class FetchPageQueue extends basicQueue_1.BasicQueue {
    constructor() {
        super(...arguments);
        /**
         * 最大同时下载数量
         */
        this.maxQueue = 2;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new FetchPageQueue();
        }
        return this._instance;
    }
    /**
     * 开始下载任务
     */
    start() {
        if (this.currQueue >= this.maxQueue || !this.waitQueue.length) {
            return;
        }
        this.currQueue += 1;
        let task = this.waitQueue.shift();
        let _self = this;
        let { pageUrl, refererUrl } = task.param;
        getHtmlByUrl_1.getHtmlByUrl(pageUrl, refererUrl).then(this.next.bind(this, task.callback, 1), this.next.bind(this, task.callback, 0));
    }
}
exports.FetchPageQueue = FetchPageQueue;
//# sourceMappingURL=fetchPageQueue.js.map