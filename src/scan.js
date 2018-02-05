import edge from 'edge-js';
import path from 'path';

export const reflect = edge.func(path.join(__dirname, '../Scan.cs'));

export function scan(assembly,) {
  return new Promise((resolve, reject) => {
    reflect(assembly, (error, result) => {
      if(error) {
        return reject(error);
      }
      resolve(result);
    });
  });
}