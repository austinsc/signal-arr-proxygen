import _ from 'lodash';
import fs from 'fs';

export function writeFile(command, file, data, section) {
  let regex = /^\/\*\* Start \w* \*\*\/$\r?\n[\s\S]*\/\*\* End \w* \*\*\//m;
  if(section) {
    regex = `/^\/\*\* Start ${section} \*\*\/$\r?\n[\s\S]*\/\*\* End ${section} \*\*\//m`;
  }
  return new Promise((resolve, reject) => {
    if(command === 'code' && fs.existsSync(file)) {
      // Update
      fs.readFile(file, (err, buffer) => {
        if(err) {
          return reject(err);
        }
        if(buffer) {
          const contents = buffer.toString();
          if(contents && contents.match(regex)) {
            data = contents.replace(regex, data);
          } else {
            return reject(`Unable to update ${file}, existing content not found.`)
          }
        }
        console.log(`Writing ${file}...`);
        fs.writeFile(file, data, err => {
          if(err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      // Create
      console.log(`Writing ${file}...`);
      fs.writeFile(file, data, err => {
        if(err) {
          return reject(err);
        }
        resolve(data);
      });
    }
  });
}

export function toUpperUnderscore(str) {
  return _.snakeCase(str).toUpperCase();
}

const isFileExp = /\.(js|json)+$/img;

export function checkOutput(argv, options) {
  if(argv.output) {
    try {
      const stat = fs.statSync(argv.output);
      // Update
      argv.op = 'update';
      argv.mode = stat.isFile()
        ? 'single'
        : 'multiple';
    } catch(err) {
      // Create
      if(err.code === 'ENOENT'){
        argv.op = 'create';
        argv.mode = argv.output.match(isFileExp)
          ? 'single'
          : 'multiple';
      } else {
        throw err;
      }
    }
    return true;
  } else {
    throw new Error('Avast! There be no output booty to plunder! (you didn\'t specify an output parameter -o --output)')
  }
}