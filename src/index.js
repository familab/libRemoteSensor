var debug = require('debug')('RemoteSensor');
var util = require('util');
var dgram = require('dgram');
var EventEmitter = require('events');
var sensorTypes = require('./sensors');

var constants = require('./constants.js');

var defaultOptions = {
  autostart: true,
  ip: null,
  port: 6000,
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
      this.listen();
    }
  }
  createSocket() {
    var server = this;
    server._socket = dgram.createSocket(server.options.type,
      function(msg, rinfo) {
        server._onMessage.call(server, msg, rinfo);
      });
  }
  listen(ip, port, cb) {
    var server = this;

    if (typeof ip === 'function') {
      cb = ip;
      ip = null;
    }

    debug('listen', ip, port);

    if (!server._socket) { this.createSocket(); }

    server._socket.bind(port || server.options.port,
        ip || server.options.ip,
      function() {
      debug('Server started on %s:%d',
        server._socket.address().address,
        server._socket.address().port);
      if (cb) { cb(); }
    });
  }
  stop() {
    if (this._socket) {
      this._socket.close();
      this._socket = null;
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

    // TODO support custom parsers for each sensor with inheritance
    // Parse with default parser
    var data = this.sensorTypes.parsers.default.call(this, msg, rinfo);
    debug('Default Parser Results: ', data);

    // Then parse with eventType parse if exists
    if (this.sensorTypes.parsers[data.msg]) {
      data = this.sensorTypes.parsers[data.msg].call(this, data, msg);
      debug('0x' + data.msg.toString(16) + ' Parser Results: ', data);
    }

    // TODO support custom handlers for each sensor with inheritance
    // Then pass to hander
    if (this.sensorTypes.handlers[data.msg]) {
      debug('Calling 0x%s handler', data.msg.toString(16));
      this.sensorTypes.handlers[data.msg].call(this, data);
    } else {
      debug('Calling default handler');
      this.sensorTypes.handlers.default.call(this, data);
    }
  }
  run(command, sensorDefinition, args) {
    // TODO support custom methods for each sensor with inheritance
    debug('Running command %s on sensor', command, sensorDefinition);
    if (this.sensorTypes.methods[command]) {
      if (!this._socket) {
        this.createSocket();
      }
      sensorDefinition._socket = this._socket;

      this.sensorTypes.methods[command].apply(sensorDefinition, args);
    } else {
      throw new Error('Command not found');
    }
  }
};

util.inherits(module.exports, EventEmitter);
