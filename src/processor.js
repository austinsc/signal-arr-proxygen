import path from 'path';
import {writeFile} from './utilities';
import {scan} from './HubScanner';

export default function(argv) {
  let promise = scan(argv.assembly);

  switch(argv.template) {
    case 'json':
      promise = promise
        .then(result => argv.mode === 'single' ? JSON.stringify(result, null, 2) : result.map(x => Object.assign(x, {r: JSON.stringify(x, null, 2)})));
      break;
    case 'redux-classic':
      const reduxClassic = require('./ReduxClassicTemplate');
      promise = promise
        .then(result => {
          let templatized = result.map(x => Object.assign(x, {r: reduxClassic(x, options)}));
          return argv.mode === 'single'
            ? templatized.map(y => y.r).join('\r\n')
            : templatized;
        });
      break;
    case 'redux':
      const redux = require('./ReduxTemplate');
      promise = promise
        .then(result => {
          let templatized = result.map(x => Object.assign(x, {r: redux(x, options)}));
          return argv.mode === 'single'
            ? templatized.map(y => y.r).join('\r\n')
            : templatized;
        });
      break;
  }

  if(argv['hub-client-url']) {
    // TODO: Implement a Hub Client generator
  }

  if(argv.mode === 'single') {
    promise = promise
      .then(result => writeFile(argv.command, path.normalize(argv.output), result));
  } else if(argv.mode === 'multiple') {
    const ext = argv.format === 'json' ? '.json' : '.js';
    promise = promise
      .then(results => Promise.all(results.map(x => writeFile(argv, path.join(argv.output, x.Name + ext), x.r))));
  } else {
    promise = promise
      .then(results => {
        results.forEach(x => x.r.split('\r\n').forEach(y => argv.print(y)));
        return results;
      });
  }

  return promise;
}
