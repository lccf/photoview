import { BasicQueue } from './basicQueue';
import { getHtmlByUrl } from './getHtmlByUrl';

export class FetchPageQueue extends BasicQueue {
  static _instance: FetchPageQueue;
  static getInstance(): FetchPageQueue {
    if (!this._instance) {
      this._instance = new FetchPageQueue();
    }

    return this._instance;
  }

  /**
   * 最大同时下载数量
   */
  protected maxQueue: number = 2;

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
    let {pageUrl, refererUrl} = task.param;
    getHtmlByUrl(pageUrl, refererUrl).then(this.next.bind(this, task.callback, 1), this.next.bind(this, task.callback, 0));
  }
}