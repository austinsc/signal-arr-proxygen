import path from 'path';
import Font from 'cfonts';
import prettyjson from 'prettyjson';
import yargs from 'yargs';
import processor from './processor';

let argv = yargs
  .usage('Usage: $0 <command> <assembly> [options]')
  .command('scan', 'scans the specified .NET assembly and prints the results to the console')
  .command('json', 'generate a JSON file that describes the specified .NET assembly')
  .command('code', 'generate a javascript source code file that describes the specified .NET assembly', y =>
    y.option('t', {
      alias: 'template',
      demand: true,
      default: 'redux',
      describe: 'the template to use to generate the source code files',
      type: 'string',
      choices: ['redux', 'redux-classic']
    }))
  //.demand(2, 'Missing required argument(s). Specify a command to execute (scan, json, code) followed by the assembly to scan (/path/to/compiled/assembly).')
  .option('f', {
    alias: 'output-file',
    demand: false,
    describe: 'Specify a file to stream the output. ',
    type: 'string'
  })
  .option('d', {
    alias: 'output-dir',
    demand: false,
    describe: 'Specify directory to stream the output. Separate files will be created/updated for each proxy generated. ',
    type: 'string'
  })
  .option('h', {
    alias: 'hub-client-url',
    demand: false,
    describe: 'Also generate a hub client with the given url.',
    type: 'string',
    group: 'Me Code Generation Options: '
  })
  .implies('h', 'd')
  .option('p', {
    alias: 'path-to-hub-client',
    demand: false,
    default: './Client',
    describe: 'The relative path to the hub client module',
    type: 'string',
    group: 'Me Code Generation Options: '
  })
  .option('c', {
    alias: 'hub-client-var',
    demand: false,
    default: '$0',
    describe: 'The name of the exported mumbo jumbo',
    type: 'string',
    group: 'Me Code Generation Options: '
  })
  .help('help')
  .epilog('For more information, go to https://github.com/RoviSys/signal-arr')
  .locale('pirate')
  .wrap(yargs.terminalWidth())
  .argv;

if(argv._.length !== 2) {
  var fonts = new Font({
    'text': 'signal-arr', //text to be converted
    'font': 'block', //define the font face
    'colors': ['red', 'white'], //define all colors
    'background': 'Black', //define the background color
    'letterSpacing': 1, //define letter spacing
    'space': true, //define if the output text should have empty lines on top and on the bottom
    'maxLength': '10' //define how many character can be on one line
  });

  yargs.showHelp('log');
} else {
  argv.command = argv._[0];
  argv.assembly = argv._[1];

  processor(argv);
}

