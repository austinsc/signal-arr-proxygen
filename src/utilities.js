import _ from 'lodash';
import fs from 'fs';

export function writeFile(argv, file, data, section) {
  if(!data) {
    throw new Error('No data to write');
  }
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

export const FILE_NAME_REGEX = /\.(js|json)+$/img;

export function validate(argv) {
  if(argv.output) {
    if(argv.output === 'console') {
      return true;
    }
    try {
      const stat = fs.statSync(argv.output);
      // Update
      argv.op = 'update';
      argv.mode = stat.isFile()
        ? 'file'
        : 'dir';
    } catch(err) {
      // Create
      if(err.code === 'ENOENT') {
        argv.op = 'create';
        argv.mode = argv.output.match(FILE_NAME_REGEX)
          ? 'file'
          : 'dir';
      } else {
        throw err;
      }
    }

    if(argv.format === 'json' && argv.mode !== 'file') {
      throw new Error('--output must be a file name and not a directory when the format mode is json');
    } else if(argv.format !== 'json' && argv.mode === 'file') {
      throw new Error('--output must be a directory and not a file name unless the format mode is json');
    }

    return true;
  } else {
    throw new Error('Avast! There be no output booty to plunder! (you didn\'t specify an output parameter -o --output)')
  }
}