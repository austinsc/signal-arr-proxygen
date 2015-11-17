import path from 'path';
import Font from 'cfonts';
import prettyjson from 'prettyjson';
import yargs from 'yargs';
import processor from './processor';

const outputOptions = {
  'f': {
    alias: 'outfile',
    demand: false,
    describe: 'Specify a file to stream the output. ',
    type: 'string'
  },
  'd': {
    alias: 'outdir',
    demand: true,
    describe: 'Specify directory to stream the output. Separate files will be created/updated for each proxy generated. ',
    type: 'string'
  }
};

let argv = yargs
  .usage('Usage: $0 <command> <assembly> [options]')
  .command('scan', 'scans the specified .NET assembly and prints the results to the console')
  .command('json', 'generate a JSON file that describes the specified .NET assembly',
    y => y
      .options(outputOptions)
      .wrap(yargs.terminalWidth())
  )
  .command('code', 'generate a javascript source code file that describes the specified .NET assembly',
    y => y.options(Object.assign({
      't': {
        alias: 'template',
        demand: true,
        default: 'redux',
        describe: 'the template to use to generate the source code files',
        type: 'string',
        choices: ['redux', 'redux-classic']
      },
      'u': {
        alias: 'huburl',
        demand: false,
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
      }
    }, outputOptions))
    .wrap(yargs.terminalWidth())
  )
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

  console.log(argv);

  //processor(argv);
}

