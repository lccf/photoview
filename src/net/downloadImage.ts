import * as fs from 'fs';
import * as Request from 'request';
import { imageDir } from '../config';

/**
 * 下载图片
 */
export let downloadImage = async function (param: { imageId: string, imageUrl: string, refererUrl: string }) {
  let {imageId, imageUrl, refererUrl} = param;
  let requestOptions: Request.Options = {
    url: imageUrl,
    headers: {
      "Referer": refererUrl
    }
  };

  let imgName = imageUrl.match(/\/([^\/]*)$/)[1];

  return new Promise(function (resolve, reject) {
    try {
      fs.accessSync(`${imageDir}/${imageId}/${imgName}`);
      resolve(`file ${imageUrl} downloaded`);
      // console.log(`file ${imageUrl} downloaded`);
    }
    catch (e) {
      try {
        let ws = Request(requestOptions).pipe(fs.createWriteStream(`${imageDir}/${imageId}/${imgName}`));
        ws.on('finish', () => {
          resolve(`download ${imageUrl} success!`);
        });
      }
      catch (err) {
        reject(err);
      }
    }
  });

}