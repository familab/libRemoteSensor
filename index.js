/**
 * Library to support communication with udp based sensors.
 */

var debug = require('debug')('RemoteSensor:Loader');
var RemoteSensor = require('./src');

var defaultOptions = {
  singleton: true,
};

var lib = module.exports = function(startupOptions) {
  var options = Object.assign({}, defaultOptions, startupOptions);
  debug('Resolved Options:', options);

  if (options.singleton) {
    if (this.lib) {
      debug('Found existing singleton');
      return this.lib;
    } else {
      debug('Created new singleton');
      this.lib = new RemoteSensor(options);
      return this.lib;
    }
  }

  return new RemoteSensor(options);
};
