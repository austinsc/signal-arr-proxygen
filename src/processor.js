import path from 'path';
import {writeFile} from './utilities';
import {scan} from './HubScanner';

export default function(argv) {
  argv.print(`Scanning ${argv.assembly}...`);
  let promise = scan(argv.assembly);

  argv.print(`Generating output...`);
  switch(argv.format) {
    case 'json':
      promise = promise
        .then(x => {
          return {
            f: argv.output,
            r: JSON.stringify(x, null, 2)
          };
        });
      break;
    case 'redux-classic':
      const reduxClassic = require('./ReduxClassicTemplate');
      promise = promise
        .then(result => result.map(x => Object.assign(x, {f: path.join(argv.output, `${x.Name}.js`), r: reduxClassic(x, argv)})));
      break;
    case 'redux':
      const redux = require('./ReduxTemplate');
      promise = promise
        .then(result => result.map(x => Object.assign(x, {f: path.join(argv.output, `${x.Name}.js`), r: redux(x, argv)})));
      break;
  }

  if(argv.output === 'console') {
    return promise
      .then(results => {
        results.forEach(x => x.r.split('\r\n').forEach(y => argv.print(y)));
        return results;
      });
  }

  return promise
    .then(results => Promise.all(results.map(x => writeFile(argv, x.f, x.r))));
}
