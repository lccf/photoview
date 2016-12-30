"use strict";
const downloadImage_1 = require("./downloadImage");
/**
 * 下载队列类
 */
class DownloadQueue {
    constructor() {
        /**
         * 最大同时下载数量
         */
        this.maxQueue = 2;
        /**
         * 当前下载数量
         */
        this.currQueue = 0;
        /**
         * 等待下载的队列
         */
        this.waitQueue = [];
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new DownloadQueue();
        }
        return this._instance;
    }
    /**
     * 添加一个下载任务
     */
    download(param, callback) {
        this.waitQueue.push({
            param, callback
        });
        this.start();
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
        downloadImage_1.downloadImage(task.param).then(this.next.bind(this, task.callback, 1), this.next.bind(this, task.callback, 0));
    }
    /**
     * 执行下一个任务
     */
    next(callback, state, data) {
        if (callback) {
            callback(state, data);
        }
        this.currQueue -= 1;
        this.start();
    }
}
exports.DownloadQueue = DownloadQueue;
//# sourceMappingURL=downloadQueue.js.map