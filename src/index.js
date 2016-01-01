var debug = require('debug')('RemoteSensor');

module.exports = class RemoteSensor {
  constructor(options) {
    debug('Resolved Options:', options);
  }
  autoDiscover(ip, port, callback) {
    debug('autoDiscover', ip, port, callback);
    throw new Error('Not Implemented');
  }
};
