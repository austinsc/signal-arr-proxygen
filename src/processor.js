import Font from 'cfonts';
import {writeFile} from './utilities';
import {scan} from './HubScanner';

export default function(argv) {
  let promise = scan(argv.assembly);
  switch(argv.command) {
    case 'scan':
      promise = promise
        .then(result => argv.f ? prettyjson.render(result) : result.map(x => Object.assign(x, {r: prettyjson.render(x)})));
      break;
    case 'json':
      promise = promise
        .then(result => argv.f ? JSON.stringify(result, null, 2) : result.map(x => Object.assign(x, {r: JSON.stringify(x, null, 2)})));
      break;
    case 'code':
      let options = {
        clientVar: argv.c,
        pathToClient: argv.p
      };
      switch(argv.t) {
        case 'redux-classic':
          const reduxClassic = require('./ReduxClassicTemplate');
          promise = promise
            .then(result => {
              let templatized = result.map(x => Object.assign(x, {r: reduxClassic(x, options)}));
              return argv.f
                ? templatized.map(y => y.r).join('\r\n')
                : templatized;
            });
          break;
        case 'redux':
          const redux = require('./ReduxTemplate');
          promise = promise
            .then(result => {
              let templatized = result.map(x => Object.assign(x, {r: redux(x, options)}));
              return argv.f
                ? templatized.map(y => y.r).join('\r\n')
                : templatized;
            });
          break;
      }
      break;
  }

  if(argv.f || argv.d) {
    var fonts = new Font({
      'text': 'signal-arr', //text to be converted
      'font': 'block', //define the font face
      'colors': '', //define all colors
      'background': 'Black', //define the background color
      'letterSpacing': 1, //define letter spacing
      'space': true, //define if the output text should have empty lines on top and on the bottom
      'maxLength': '10' //define how many character can be on one line
    });
  }
  if(argv.h) {
    // TODO: Implement a Hub Client generator
  }

  if(argv.f) {
    promise = promise
      .then(result => writeFile(argv.command, path.normalize(argv.f), result));
  } else if(argv.d) {
    const ext = argv.command === 'json' ? '.json' : '.js';
    promise = promise
      .then(results => Promise.all(results.map(x => writeFile(argv.command, argv.d + x.Name + ext, x.r))));
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
