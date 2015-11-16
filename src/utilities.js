import fs from 'fs';

export function writeFile(command, file, data) {
  console.log(`Writing ${file}...`);
  if(command === 'code' && fs.existsSync(file)) {
    // Update
    return data;
  } else {
    // Create
    return new Promise((resolve, reject) => {
      fs.writeFile(file, data, err => {
        if(err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }
}