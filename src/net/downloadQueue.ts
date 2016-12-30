import { downloadImage } from './downloadImage';

/**
 * 下载队列类
 */
export class DownloadQueue {
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
  private maxQueue: number = 2;

  /**
   * 当前下载数量
   */
  private currQueue: number = 0;

  /**
   * 等待下载的队列
   */
  private waitQueue: any[] = [];

  /**
   * 添加一个下载任务
   */
  download(param, callback?: Function) {
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
    downloadImage(task.param).then(this.next.bind(this, task.callback, 1), this.next.bind(this, task.callback, 0));
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