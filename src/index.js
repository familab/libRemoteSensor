var debug = require('debug')('RemoteSensor');
var util = require('util');
var dgram = require('dgram');
var EventEmitter = require('events');
var sensorTypes = require('./sensors');

var constants = require('./constants.js');

var defaultOptions = {
  autostart: true,
  ip: null,
  discoveryPort: 6000,
  type: 'udp4',
};

module.exports = class RemoteSensor {
  constructor(startupOptions) {
    this.options = Object.assign({}, defaultOptions, startupOptions);
    debug('Resolved Options:', this.options);

    EventEmitter.call(this);

    this.knownSensors = [];
    this.sensorTypes = sensorTypes;

    if (this.options.autostart) {
      this.autoDiscover();
    }
  }
  autoDiscover(ip, port, cb) {
    var server = this;
    debug('autoDiscover', ip, port);

    server._discoverySocket = dgram.createSocket(server.options.type,
      function(msg, rinfo) {
        server._onMessage.call(server, msg, rinfo);
      });
    server._discoverySocket.bind(port || server.options.discoveryPort,
        ip || server.options.ip,
      function() {
      debug('Discovery Server started on %s:%d',
        server._discoverySocket.address().address,
        server._discoverySocket.address().port);
      if (cb) { cb(); }
    });
  }
  stop() {
    if (this._discoverySocket) {
      this._discoverySocket.close();
      this._discoverySocket = null;
    }
    if (this._socket) {
      this._socket.close();
      this._socket = null;
    }
  }
  _onMessage(msg, rinfo) {
    debug('Received %d bytes from %s:%d\n',
      msg.length, rinfo.address, rinfo.port);
    debug(msg);

    // Parse with default parser
    var data = this.sensorTypes.parsers.default.call(this, msg, rinfo);
    debug('Default Parser Results: ', data);

    // Then parse with eventType parse if exists
    if (this.sensorTypes.parsers[data.msg]) {
      data = this.sensorTypes.parsers[data.msg].call(this, data, msg);
      debug('0x' + data.msg.toString(16) + ' Parser Results: ', data);
    }

    // Then pass to hander
    if (this.sensorTypes.handlers[data.msg]) {
      debug('Calling 0x%s handler', data.msg.toString(16));
      this.sensorTypes.handlers[data.msg].call(this, data);
    } else {
      debug('Calling default handler');
      this.sensorTypes.handlers.default.call(this, data);
    }
  }
  run(command, sensorDefinition) {
    debug('Running command %s on sensor', command, sensorDefinition);
    if (this.sensorTypes[sensorDefinition.type] &&
        this.sensorTypes[sensorDefinition.type].methods[command]) {
      if (!this._socket) {
        this._socket = dgram.createSocket(this.options.type);
      }
      sensorDefinition._socket = this._socket;

      var method = this.sensorTypes[sensorDefinition.type].methods[command];
      method.call(sensorDefinition);
    } else {
      throw new Error('Command not found');
    }
  }
};

util.inherits(module.exports, EventEmitter);
