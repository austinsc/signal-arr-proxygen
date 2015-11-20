import fs from 'fs';
import inquirer from 'inquirer';
import {processor} from './processor';
import {scan} from './scan';
import {FILE_NAME_REGEX} from './utilities';


export default function(argv) {
  return scan(argv.assembly)
    .then(hubs => new Promise((resolve) => {
      const questions = [{
        type: 'checkbox',
        name: 'hubs',
        message: 'We plundered these hubs captain! What shall we do with em? (Those unchecked will be thrown overboard!)',
        choices: hubs.map(hub => {
          return {
            name: hub.Name,
            checked: true
          };
        })
      }, {
        type: 'list',
        name: 'mode',
        message: 'What would ye like to do with yer hubs?',
        choices: [
          'preview',
          'save'
        ]
      }, {
        type: 'list',
        name: 'format',
        message: 'Pick some blackmagic voodoo...',
        choices(answers){
          return answers.mode === 'preview' ? [
            'redux',
            'redux-classic',
            'json',
            'pretty'
          ] : [
            'redux',
            'redux-classic',
            'json'
          ];
        }
      }, {
        type: 'input',
        name: 'output',
        message: 'Ye have selected to preserve yer output. Where would ye like to save yer new booty?',
        validate(value, answers) {
          try {
            const stat = fs.statSync(value);
            if(answers.format === 'json' && !stat.isFile()) {
              return 'You picked json so you best provide a file name, scallywag. Arrgh!';
            }
            if(answers.format !== 'json' && stat.isFile()) {
              return 'You\'d be better off pickin a directory for savin yer hubs.';
            }
            return true;
          } catch(err) {
            if(err.code === 'ENOENT') {
              const isFile = value.match(FILE_NAME_REGEX);
              if(answers.format === 'json' && !isFile) {
                return 'You picked json so you best provide a file name, scallywag. Arrgh!';
              }
              if(answers.format !== 'json' && isFile) {
                return 'You\'d be better off pickin a directory for savin yer hubs.';
              }
              return true;
            }
            return err;
          }
        },
        when(answers) {
          return answers.mode === 'save';
        }
      }];

      inquirer.prompt(questions, (answers) => {
        argv.output = answers.output || 'console';
        argv.format = answers.format;
        argv.hubs = hubs.filter(hub => answers.hubs.indexOf(hub.Name) !== -1);
        resolve(processor(argv));
      });
    }));
}