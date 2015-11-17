import fs from 'fs';
import path from 'path';
import Font from 'cfonts';
import prettyjson from 'prettyjson';
import yargs from 'yargs';
import processor from './processor';
import {checkOutput} from './utilities';

let argv = yargs
  .usage('Usage: $0 <command> <assembly> [options]')
  .command('scan', 'scans the specified .NET assembly and prints the results to the console',
    y => y
      .wrap(yargs.terminalWidth())
  )
  .command('generate', 'generates output using the specified formatter that describes the .NET assembly',
    y => y
      .options({
        'o': {
          alias: 'output',
          demand: true,
          describe: 'the destination (the path to the file, directory, or console)',
          type: 'string'
        },
        'f': {
          alias: 'format',
          demand: true,
          default: 'json',
          describe: 'the formatter used to produce the output',
          type: 'string',
          choices: ['json', 'redux', 'redux-classic']
        },
        'u': {
          alias: 'huburl',
          demand: false,
          default: '/signalr',
          describe: 'Also generate a hub client with the given url.',
          type: 'string',
          group: 'Me Code Generation Options: '
        },
        'p': {
          alias: 'hubpath',
          demand: false,
          default: './Client',
          describe: 'The relative path to the hub client module',
          type: 'string',
          group: 'Me Code Generation Options: '
        },
        'v': {
          alias: 'hubvar',
          demand: false,
          default: '$0',
          describe: 'The name of the exported mumbo jumbo',
          type: 'string',
          group: 'Me Code Generation Options: '
        },
        'w': {
          alias: 'watch',
          demand: false,
          default: false,
          describe: 'enable this option to watch the target assembly for changes, and re-run the update once it has completed',
          type: 'bool'
        }
      })
      .wrap(yargs.terminalWidth())
      .check(checkOutput)
  )
  .help('h')
  .alias('h', 'help')
  .epilog('For more information, go to https://github.com/RoviSys/signal-arr')
  .locale('pirate')
  .wrap(yargs.terminalWidth())
  .argv;

if(argv._.length !== 2) {
  const fonts = new Font({
    'text': 'signal-arr', //text to be converted
    'font': 'block', //define the font face
    'colors': ['red', 'white'], //define all colors
    'background': 'Black', //define the background color
    'letterSpacing': 1, //define letter spacing
    'space': true, //define if the output text should have empty lines on top and on the bottom
    'maxLength': '10' //define how many character can be on one line
  });
  // TODO: add the interactive stuff here
} else {
  argv.command = argv._[0];
  argv.assembly = argv._[1];
  argv.print = console.log;
  argv.writeFile = fs.writeFile;
  argv.readFile = fs.readFile;
  console.dir(argv);


  processor(argv).catch(console.error);
}

