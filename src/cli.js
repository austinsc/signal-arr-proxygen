import Font from 'cfonts';
import prettyjson from 'prettyjson';
import yargs from 'yargs';
import {scan} from './HubScanner';



var argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .example('$0 -a ./bin/Debug/Website.dll', 'scan the given assembly for SignalR Hubs')
  .demand('a')
  .alias('a', 'assembly')
  .nargs('a', 1)
  .describe('a', 'Assembly to reflect')
  .alias('j', 'json')
  .describe('j', 'Set the output to a JSON object describing the reflected assembly')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2015')
  .argv;

if(argv.json) {
  scan(argv.a)
    .then(result => console.log(JSON.stringify(result)));
} else {
  scan(argv.a)
    .then(result => console.log(prettyjson.render(result)));


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
