"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basicQueue_1 = require("./basicQueue");
const downloadImage_1 = require("./downloadImage");
/**
 * 下载队列类
 */
class DownloadQueue extends basicQueue_1.BasicQueue {
    constructor() {
        super(...arguments);
        /**
         * 最大同时下载数量
         */
        this.maxQueue = 2;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new DownloadQueue();
        }
        return this._instance;
    }
    /**
     * 开始下载任务
     */
    start() {
        if (this.currQueue >= this.maxQueue) {
            return;
        }
        this.currQueue += 1;
        let task = this.waitQueue.shift();
        let _self = this;
        downloadImage_1.downloadImage(task.param).then(this.next.bind(this, task.callback, 1), this.next.bind(this, task.callback, 0));
    }
}
exports.DownloadQueue = DownloadQueue;
//# sourceMappingURL=downloadQueue.js.map