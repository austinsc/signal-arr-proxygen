import _ from 'lodash';
import fs from 'fs';

export function writeFile(argv, file, data, section) {
  const {readFile, print, writeFile, op} = argv;
  let regex = /^\/\*\* Start \w* \*\*\/$\r?\n[\s\S]*\/\*\* End \w* \*\*\//m;
  if(section) {
    regex = `/^\/\*\* Start ${section} \*\*\/$\r?\n[\s\S]*\/\*\* End ${section} \*\*\//m`;
  }
  return new Promise((resolve, reject) => {
    if(op === 'update') {
      // Update
      readFile(file, (err, buffer) => {
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
        print(`Writing ${file}...`);
        writeFile(file, data, err => {
          if(err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      // Create
      print(`Writing ${file}...`);
      writeFile(file, data, err => {
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

export function checkOutput(argv) {
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