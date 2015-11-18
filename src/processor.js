import path from 'path';
import {writeFile} from './utilities';
import {scan} from './HubScanner';
import prettyjson from 'prettyjson';
import cardinal from 'cardinal';

export default function(argv) {
  argv.print(`Scanning ${argv.assembly}...`);

  let promise = argv.hubs
    ? new Promise(resolve => resolve(argv.hubs))
    : scan(argv.assembly);

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
    case 'pretty':
      promise = promise
        .then(x => {
          return {
            f: argv.output,
            r: prettyjson.render(x)
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
        if(argv.format === 'pretty') {
          argv.print(results.r);
        } else if(argv.format === 'json') {
          argv.print(cardinal.highlight(results.r, {json: true, linenos: true}));
        } else {
          try{
            results.forEach(x => argv.print(cardinal.highlight(x.r, {linenos: true})));
          } catch (err) {
            results.forEach(x => argv.print(x.r));
          }
        }
        return results;
      });
  }

  return promise
    .then(results => Promise.all(results.map(x => writeFile(argv, x.f, x.r))));
}
