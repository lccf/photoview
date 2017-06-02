import { Subject } from 'rxjs';
export class BasicQueue {
  /**
   * 事件队列
   */
  protected subjectHandle = new Subject();
  /**
   * 最大同时下载数量
   */
  protected maxQueue: number = 1;

  /**
   * 当前下载数量
   */
  protected currQueue: number = 0;

  /**
   * 等待下载的队列
   */
  protected waitQueue: any[] = [];

  /**
   * 添加一个下载任务
   */
  addQueue(param, callback?: Function) {
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
    } else {
      this.start();
    }
  }

  /**
   * 注册事件
   */
  subscribe(subscribeParam: any) {
    this.subjectHandle.subscribe(subscribeParam);
  }
}