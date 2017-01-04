import * as fs from 'fs';
import * as url from 'url';
import * as request from 'request';
import * as cheerio from 'cheerio';

import { getHtmlByUrl, DownloadQueue } from '../net';
import { Group, Image } from '../model';

export class ParseUrl {
  public pageHtml: string = '';
  constructor(public url: string, public refererUrl: string = '') {

  }

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

  async parsePageInfo() {
    let html = await this.getHtml();
    let $html = cheerio.load(html).root();
    debugger
    let author = $html.find('.userName').eq(0).find('a').text().replace(/^\s*|\s*$/g, '');
    let title = $html.find('.workTitle').text().replace(/^\s*|原创作品：|\s*$/g, '');
    let desc = $html.find('.workInfor').html().replace(/^\s*|\s*$/g, '');
    return new Promise<{title: string, author: string, desc: string, url: string}>(resolve => resolve({title, author, desc, url: this.url}));
  }

  async parsePageImageByUrl(pageUrl: string) {
    let imageUrls: Array<{ img: string, origin: string, imageId: string }> = [];
    let imageIdMatch = this.url.match(/work\/([^=]+)/);
    let imageId: string = 'image_id_' + (new Date());
    if (imageIdMatch != null) {
      imageId = imageIdMatch[1];
    }
    let html = await this.getHtml(pageUrl);
    let $imgs = cheerio('.workShow li', html);
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
}
