'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cfonts = require('cfonts');

var _cfonts2 = _interopRequireDefault(_cfonts);

var _prettyjson = require('prettyjson');

var _prettyjson2 = _interopRequireDefault(_prettyjson);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _HubScanner = require('./HubScanner');

var argv = require('yargs').usage('Usage: $0 <command> [options]').example('$0 -a ./bin/Debug/Website.dll', 'scan the given assembly for SignalR Hubs').demand('a').alias('a', 'assembly').nargs('a', 1).describe('a', 'Assembly to reflect').alias('j', 'json').describe('j', 'Set the output to a JSON object describing the reflected assembly').help('h').alias('h', 'help').epilog('copyright 2015').argv;

if (argv.json) {
  (0, _HubScanner.scan)(argv.a).then(function (result) {
    return console.log(JSON.stringify(result));
  });
} else {
  (0, _HubScanner.scan)(argv.a).then(function (result) {
    return console.log(_prettyjson2['default'].render(result));
  });

  var fonts = new _cfonts2['default']({
    'text': 'signal-arr', //text to be converted
    'font': 'block', //define the font face
    'colors': '', //define all colors
    'background': 'Black', //define the background color
    'letterSpacing': 1, //define letter spacing
    'space': true, //define if the output text should have empty lines on top and on the bottom
    'maxLength': '10' //define how many character can be on one line
  });
}
//# sourceMappingURL=cli.js.map