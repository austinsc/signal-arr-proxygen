import {scan} from './HubScanner';
import prettyjson from 'prettyjson';

scan('', function(error, result) {
  if(error) throw error;
  console.log(prettyjson.render(result));
});
