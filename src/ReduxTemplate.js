/**
 * Created by alanskas on 11/16/2015.
 */

import _ from 'lodash';

export const method =
  'let {server, client} = client.connection.${ Hub };' +
  'const initialState = [];' +

  '<% _.each(hubs, hub => {' +
    'var name = hub.Name;' +
    'var upperName = name.toUpperCase();' +
    'var clientMethods = this.GetClientMethods(hub)' +
    'var serverMethods = this.GetServerMethods(hub)' +
    'var actionTypes = name + \'ActionTypes\'' +
    'var actionCreators = name + \'ActionCreators\'' +

  'export var ${ hub } = {} ' +
  'export const ${ actionTypes } = {' +
  '<% _.each(clientMethods, method => {';

