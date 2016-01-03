var debug = require('debug')('RemoteSensor');
var util = require('util');
var dgram = require('dgram');
var EventEmitter = require('events');

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
    }
  }
  _onMessage(msg, rinfo) {
    debug('Received %d bytes from %s:%d\n',
      msg.length, rinfo.address, rinfo.port);
    debug(msg);
    this.emit('message', msg, rinfo);

    if (!this.knownSensors[rinfo.address + ':' + rinfo.port]) {
      // New Sensor
      var messageType = msg.readUInt8(0);
      if (messageType === constants.MESSAGE_TYPE.BEACON) {
        var sensorType = msg.readUInt8(2);
        var sensorDefinition = {
          name: 'Sensor-' + rinfo.address + ':' + rinfo.port,
          ip: rinfo.address,
          port: rinfo.port,
          type: sensorType,
        };
        this.emit('newSensor', sensorDefinition);
      }
    }
  }
};

util.inherits(module.exports, EventEmitter);
