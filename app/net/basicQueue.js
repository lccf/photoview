"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class BasicQueue {
    constructor() {
        /**
         * 事件队列
         */
        this.subjectHandle = new rxjs_1.Subject();
        /**
         * 最大同时下载数量
         */
        this.maxQueue = 1;
        /**
         * 当前下载数量
         */
        this.currQueue = 0;
        /**
         * 等待下载的队列
         */
        this.waitQueue = [];
    }
    /**
     * 添加一个下载任务
     */
    addQueue(param, callback) {
        this.waitQueue.push({
            param, callback
        });
        this.start();
    }
    /**
     * 开始下载任务
     */
    start() {
    }
    /**
     * 执行下一个任务
     */
    next(callback, state, data) {
        if (callback) {
            callback(state, data);
        }
        this.currQueue -= 1;
        if (!this.waitQueue.length) {
            this.subjectHandle.complete();
        }
        else {
            this.start();
        }
    }
    /**
     * 注册事件
     */
    subscribe(subscribeParam) {
        this.subjectHandle.subscribe(subscribeParam);
    }
}
exports.BasicQueue = BasicQueue;
//# sourceMappingURL=basicQueue.js.map