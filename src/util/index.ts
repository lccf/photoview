import * as fs from 'fs';
import * as path from 'path';

export let existSync = path => {
  try {
    fs.accessSync(path);
    return true;
  }
  catch(e) {
    return false;
  }
}

export let mkdirs = (filePath: string) => {
  filePath = path.resolve(filePath);
  let temp = filePath;
  let { root } = path.parse(filePath);
  let dirs: string[] = [];
  
  while(temp != root) {
    dirs.push(temp);
    temp = path.dirname(temp);
  }

  while(dirs.length) {
    temp = dirs.pop();
    if (!existSync(temp)) {
      fs.mkdirSync(temp);
    }
  }
}

export let trim = (str: string) => {
  return str.replace(/^\s+|\s+$/g, '');
}