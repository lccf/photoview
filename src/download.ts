import * as fs from 'fs';
import * as url from 'url';
import * as request from 'request';
import * as cheerio from 'cheerio';
import { Subject } from 'rxjs';

import { trim } from './util';
import { getHtmlByUrl, DownloadQueue, FetchPageQueue } from './net';
import { Group, Image } from './model';

enum fetchPageModel {
  nextPage
}

export class Capture {
  // public url: string = 'http://www.zcool.com.cn/work/ZMTkxNTgxNjA=.html'
  public url: string = 'http://www.zcool.com.cn/work/ZMTk1NDU2MjQ=.html';
  public refererUrl: string = 'http://www.zcool.com.cn/works/33!0!!0!0!200!1!1!!!/';

  public pageHtml: string = '';

  public pageModel: fetchPageModel = fetchPageModel.nextPage;

  async getHtml(pageUrl: string = '') {
    let saveHtml = false;
    let pageHtml = '';
    if (!pageUrl) {
      pageUrl = this.url;
      saveHtml = true;
      pageHtml = this.pageHtml
    }
    if (!pageHtml) {
      pageHtml = await getHtmlByUrl(pageUrl, this.refererUrl);
      if (saveHtml) {
        this.pageHtml = pageHtml;
      }
    }
    return new Promise<string>(resolve => resolve(pageHtml));
  }

  parseNextPageUrl(html: string, pageUrl: string) {
    let $nextPage = cheerio('.laypage_next', html);
    let nextPageUrl: string = '';
    debugger;
    if ($nextPage.length) {
      nextPageUrl = url.resolve(this.url, $nextPage.attr('href'));
      this.startByUrl(nextPageUrl, pageUrl, true);
    }
    else {
      FetchPageQueue.getInstance().complete();
    }
  }

  async parsePageImageByHtml(html: string) {
    let imageUrls: Array<{ img: string, origin: string, imageId: string }> = [];
    let imageIdMatch = this.url.match(/work\/([^=]+)/);
    let imageId: string = 'image_id_' + (new Date());
    if (imageIdMatch != null) {
      imageId = imageIdMatch[1];
    }
    let $imgs = cheerio('.light-slide-content', html);
    $imgs.each((index, img) => {
      let $img = cheerio(img);
      let $imgLink = $img.find('.image-link');
      let originUrl: string = '';
      if ($imgLink.length) {
        originUrl = $imgLink.attr('href').split('=')[1];
      }
      imageUrls.push({
        imageId: imageId,
        img: $img.find('img').attr('src'),
        origin: originUrl
      });
    });
    return new Promise<{ img: string, origin: string, imageId: string }[]>(resolve => resolve(imageUrls));
  }

  async parsePageImageByUrl(pageUrl: string) {
    let html = await this.getHtml(pageUrl);
    return this.parsePageImageByHtml(html);
  }

  async downloadImageByPageHtml(html: string) {
    let images = await this.parsePageImageByHtml(html);
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
    let downloadQueue = DownloadQueue.getInstance();
    let allTask: Array<Promise<string>> = [];
    for (let img of images) {
      let imageId = img.imageId;
      let imageUrl = img.origin || img.img;
      let refererUrl = this.url;
      allTask.push(
        new Promise(resolve => {
          downloadQueue.addQueue({ imageId, imageUrl, refererUrl }, function (state, data) {
            console.log(data);
            resolve(data);
          });
        })
      ); 
    }
    return new Promise<string>(resolve => Promise.all(allTask).then(data => resolve('success')));
  }

  async parseAllPageUrl() {
    let html = await this.getHtml();
    let $pages = cheerio('.workShow .bigPage a', html);
    let urls: string[] = [this.url];
    $pages.each((index, tag) => {
      let $tag = cheerio(tag);
      if ($tag.length && !$tag.attr('class') && $tag.attr('href')
        && $tag.attr('href').match(/^\/work.*\.html$/) != null) {
        urls.push(url.resolve(this.url, $tag.attr('href')));
      }
    });
    return new Promise<string[]>(resolve => resolve(urls));
  }

  async parseAllPageImage() {
    let urls = await this.parseAllPageUrl();
    let images: any[] = [];
    for (let pageUrl of urls) {
      let pageImages = await this.parsePageImageByUrl(pageUrl);
      images = images.concat(pageImages);
    }
    return new Promise<{ img: string, origin: string, imageId: string }[]>(resolve => resolve(images));
  }

  async downloadAllPageImage() {
    let images = await this.parseAllPageImage();
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
    let downloadQueue = DownloadQueue.getInstance();
    let allTask: Array<Promise<string>> = [];
    for (let img of images) {
      let imageId = img.imageId;
      let imageUrl = img.origin || img.img;
      let refererUrl = this.url;
      allTask.push(
        new Promise(resolve => {
          downloadQueue.addQueue({ imageId, imageUrl, refererUrl }, function (state, data) {
            console.log(data);
            resolve(data);
          });
        })
      ); 
    }
    return new Promise<string>(resolve => Promise.all(allTask).then(data => resolve('success')));
  }

  async parsePageInfo() {
    let html = await this.getHtml();
    let $html = cheerio.load(html).root();
    let author = $html.find('.userName').eq(0).find('a').text().replace(/^\s*|\s*$/g, '');
    let title = $html.find('.workTitle').text().replace(/^\s*|原创作品：|\s*$/g, '');
    let desc = $html.find('.workInfor').html().replace(/^\s*|\s*$/g, '');
    return new Promise<{title: string, author: string, desc: string, url: string}>(resolve => resolve({title, author, desc, url: this.url}));
  }

  async startByUrl(pageUrl: string, refererUrl?: string, isChild?: boolean) {
    if (!refererUrl) {
      refererUrl = pageUrl;
    }
    this.url = pageUrl;
    this.refererUrl = refererUrl;

    let pageQueue = FetchPageQueue.getInstance();
    let param = {
      pageUrl,
      refererUrl
    }
    let _self = this;
    
    if (!isChild) {
      return new Promise<string>(resolve => {
        pageQueue.subscribe({
          next: function() {
            console.log('pageQueue next');
          },
          complete: function() {
            debugger;
            resolve('download success!')
          }
        });
        pageQueue.addQueue({ pageUrl, refererUrl }, (state, data) => {
          _self.downloadImageByPageHtml(data).then(console.log);
          _self.parseNextPageUrl(data, _self.url);
        });
      })
    }
    else {
      pageQueue.addQueue({ pageUrl, refererUrl }, (state, data) => {
        _self.downloadImageByPageHtml(data).then(console.log);
        _self.parseNextPageUrl(data, _self.url);
      });
    }
  }

  hasGroup() {
    let url = this.url;

    Group.where<Group>({ url }).fetch().then(group => {
      console.log(JSON.stringify(group));
    }).catch(err => {
      console.log(err);
    });
  }

  addGroup() {
    let group = new Group({
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

export const test = () => {
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
}

export class Download {
  download(pageUrl: string, refererUrl: string) {
    let capture = new Capture();
    capture.startByUrl(pageUrl, refererUrl).then(msg => console.log);
  }
  render() {
    let html:string = `
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
    let btn = document.querySelector('#app button') as HTMLButtonElement;
    let _self = this;
    btn.addEventListener('click', function() {
      let pageUrl: string = (document.querySelector('#pageUrl') as HTMLInputElement).value;
      let refererUrl: string = (document.querySelector('#refererUrl') as HTMLInputElement).value;
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