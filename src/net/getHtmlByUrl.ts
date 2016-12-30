import * as Request from 'request';

/**
 * 获取页面html
 */
export let getHtmlByUrl = async function(requestUrl: string, refererUrl: string = '') {
  if (refererUrl == '') {
    refererUrl = requestUrl;
  }
  let requestOptions: Request.Options = {
    url: requestUrl,
    headers: {
      "Referer": refererUrl
    }
  };
  return new Promise<string>(resolve => {
    Request(requestOptions, (error, response, body) => resolve(body));
  });
}