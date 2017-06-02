import { BasicQueue } from './basicQueue';
import { downloadImage } from './downloadImage';

/**
 * 下载队列类
 */
export class DownloadQueue extends BasicQueue {
  static _instance: DownloadQueue;
  static getInstance(): DownloadQueue {
    if (!this._instance) {
      this._instance = new DownloadQueue();
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
    if (this.currQueue >= this.maxQueue) {
      return;
    }
    this.currQueue += 1;
    let task = this.waitQueue.shift();
    let _self = this;
    downloadImage(task.param).then(this.next.bind(this, task.callback, 1), this.next.bind(this, task.callback, 0));
  }
}
