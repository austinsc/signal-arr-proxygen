import fs from 'fs';
import path from 'path';
import Font from 'cfonts';
import yargs from 'yargs';
import watchr from 'watchr';
import processor from './processor';
import {checkOutput} from './utilities';
import interactive from './interactive';

let argv = yargs
  .usage('Usage: $0 <command> <assembly> [options]')
  .command('interactive', 'runs the utility in interactive (Q & A) mode.')
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
          type: 'boolean'
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

if(argv._.length < 2) {
  new Font({text: ' signal-arr', colors: ['red', 'white'], maxLength: '11'});
  yargs.showHelp('log');
} else {
  argv.command = argv._[0];
  argv.assembly = argv._[1];
  argv.print = console.log;
  argv.writeFile = fs.writeFile;
  argv.readFile = fs.readFile;
  if(argv.command === 'interactive') {
    interactive(argv).catch(console.error);;
  } else {
    if(argv.watch) {
      watchr.watch({
        path: argv.assembly,
        listener() {
          processor(argv).catch(console.error);
        }
      });
    }
    processor(argv).catch(console.error);
  }
}

