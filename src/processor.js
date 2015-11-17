import path from 'path';
import {writeFile} from './utilities';
import {scan} from './HubScanner';

export default function(argv) {
  let promise = scan(argv.assembly);
  switch(argv.command) {
    case 'scan':
      promise = promise
        .then(result => argv['output-file'] ? prettyjson.render(result) : result.map(x => Object.assign(x, {r: prettyjson.render(x)})));
      break;
    case 'json':
      promise = promise
        .then(result => argv['output-file'] ? JSON.stringify(result, null, 2) : result.map(x => Object.assign(x, {r: JSON.stringify(x, null, 2)})));
      break;
    case 'code':
      let options = {
        clientVar: argv['hub-client-var'],
        pathToClient: argv['path-to-hub-client']
      };
      switch(argv.template) {
        case 'redux-classic':
          const reduxClassic = require('./ReduxClassicTemplate');
          promise = promise
            .then(result => {
              let templatized = result.map(x => Object.assign(x, {r: reduxClassic(x, options)}));
              return argv['output-file']
                ? templatized.map(y => y.r).join('\r\n')
                : templatized;
            });
          break;
        case 'redux':
          const redux = require('./ReduxTemplate');
          promise = promise
            .then(result => {
              let templatized = result.map(x => Object.assign(x, {r: redux(x, options)}));
              return argv['output-file']
                ? templatized.map(y => y.r).join('\r\n')
                : templatized;
            });
          break;
      }
      break;
  }

  if(argv['hub-client-url']) {
    // TODO: Implement a Hub Client generator
  }

  if(argv['output-file']) {
    promise = promise
      .then(result => writeFile(argv.command, path.normalize(argv['output-file']), result));
  } else if(argv['output-dir']) {
    const ext = argv.command === 'json' ? '.json' : '.js';
    promise = promise
      .then(results => Promise.all(results.map(x => writeFile(argv.command, path.join(argv['output-dir'], x.Name + ext), x.r))));
  } else {
    promise = promise
      .then(results => {
        results.forEach(x => x.r.split('\r\n').forEach(y => console.log(y)));
        return results;
      });
  }

  promise
    .catch(console.error);

  return promise;
}
