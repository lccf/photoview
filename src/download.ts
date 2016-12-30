import * as fs from 'fs';
import * as url from 'url';
import * as $ from 'jquery';
import * as request from 'request';

import { getHtmlByUrl, DownloadQueue } from './net';
import { Group, Image } from './model';

export class Capture {
  // public url: string = 'http://www.zcool.com.cn/work/ZMTkxNTgxNjA=.html'
  public url: string = 'http://www.zcool.com.cn/work/ZMTk1NDU2MjQ=.html';
  public refererUrl: string = 'http://www.zcool.com.cn/works/33!0!!0!0!200!1!1!!!/';

  public pageHtml: string = '';

  async getHtml(pageUrl: string = '') {
    let saveHtml = false;
    let pageHtml = this.pageHtml;
    if (!pageUrl) {
      pageUrl = this.url;
      saveHtml = true;
    }
    if (!pageHtml) {
      pageHtml = await getHtmlByUrl(pageUrl, this.refererUrl);
      if (saveHtml) {
        this.pageHtml = pageHtml;
      }
    }
    return new Promise<string>(resolve => resolve(pageHtml));
  }

  parseImage() {
    let imageUrls: Array<{ img: string, origin: string, imageId: string }> = [];
    let imageIdMatch = this.url.match(/work\/([^=]+)/);
    let imageId: string = 'image_id_' + (new Date());
    if (imageIdMatch != null) {
      imageId = imageIdMatch[1];
    }
    this.getHtml().then(html => {
      let $imgs = $(html).find('.workShow li');
      $imgs.each(function () {
        let $img = $(this);
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
      this.downloadImage(imageUrls);
    });
  }

  downloadImage(urls: Array<{ img: string, origin: string, imageId: string }>) {
    try {
      fs.accessSync(`./data`);
    }
    catch (e) {
      fs.mkdirSync(`./data`);
    }
    try {
      fs.accessSync(`./data/${urls[0].imageId}`);
    }
    catch (e) {
      fs.mkdirSync(`./data/${urls[0].imageId}`);
    }
    let downloadQueue = DownloadQueue.getInstance();

    for (let img of urls) {
      let imageId = img.imageId;
      let imageUrl = img.origin || img.img;
      let refererUrl = this.url;
      downloadQueue.download({ imageId, imageUrl, refererUrl }, function (state, data) {
        console.log(data);
      });
    }
  }

  parsePageImage(url: string) {
    this.url = url;
    this.parseImage();
  }

  async parsePageImageByUrl(pageUrl: string) {
    let imageUrls: Array<{ img: string, origin: string, imageId: string }> = [];
    let imageIdMatch = this.url.match(/work\/([^=]+)/);
    let imageId: string = 'image_id_' + (new Date());
    if (imageIdMatch != null) {
      imageId = imageIdMatch[1];
    }
    let html = await this.getHtml(pageUrl);
    let $imgs = $(html).find('.workShow li');
    $imgs.each(function () {
      let $img = $(this);
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

  async parseAllPageUrl() {
    let html = await this.getHtml();
    let $pages = $(html).find('.workShow .bigPage a');
    let urls: string[] = [this.url];
    $pages.each((index, tag) => {
      let $tag = $(tag);
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
          downloadQueue.download({ imageId, imageUrl, refererUrl }, function (state, data) {
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
    let $html = $(html);
    let author = $html.find('.userName:eq(0) a').text().replace(/^\s*|\s*$/g, '');
    let title = $html.find('.workTitle').text().replace(/^\s*|原创作品：|\s*$/g, '');
    let desc = $html.find('.workInfor').html().replace(/^\s*|\s*$/g, '');
    return new Promise<{title: string, author: string, desc: string, url: string}>(resolve => resolve({title, author, desc, url: this.url}));
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
  // capture.parseAllPageImage().then(imageUrls => console.log(imageUrls));
  // capture.downloadAllPageImage().then(data => console.log(data));
  capture.parsePageInfo().then(pageInfo => console.log(pageInfo));
  // capture.addGroup();
}