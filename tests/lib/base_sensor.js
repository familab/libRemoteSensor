var debug = require('debug')('BaseSensor');
var dgram = require('dgram');
var util = require('util');
var EventEmitter = require('events');
var constants = require('../../src/constants.js');

var STATUS_CODE = constants.STATUS_CODE;
var MESSAGE_TYPE = constants.MESSAGE_TYPE;

var defaultOptions = {
  beaconInterval: 60000,
  protocol: 'udp4',
  type: 'BaseSensor',
  typeCode: 0x00,
  port: null,
  address: null,
  broadcastAddress: '255.255.255.255',
  broadcastPort: '6000',
  handlers: {
    default: function(data, rinfo) {
      debug('Received data from %s:%d\n', rinfo.address, rinfo.port, data);
    },
    0x00: function beacon(data, rinfo) {
      debug('Received beacon from %s:%d\n', rinfo.address, rinfo.port);
    },
    0xFF: function reset(data, rinfo) {
      debug('Received reset command from %s:%d\n', rinfo.address, rinfo.port);
      this.emit('reset');
    },
  },
  parsers: {
    default: function(msg) {
      return {
        type: msg.readUInt8(0),
      };
    },
  },
  listeners: {
    reset: function() {
      this.startTime = process.uptime();
    },
  },
};

/**
 * Class Base Sensor
 *
 * Abstract Class that impliments a sensor.
 *
 * @type BaseSensor
 */
module.exports = class BaseSensor {
  constructor(startupOptions, cb) {
    var sensor = this;
    var options = Object.assign({}, defaultOptions, startupOptions);
    debug('Resolved Options:', options);

    EventEmitter.call(this);

    sensor.options = options;

    sensor.emit('started');
    sensor.status = STATUS_CODE.STARTED;

    sensor._socket = dgram.createSocket(sensor.options.protocol,
      function(msg, rinfo) {
        sensor._onMessage.call(sensor, msg, rinfo);
      });
    sensor._socket.bind(sensor.options.port, sensor.options.address,
      function() {
      sensor._socket.setBroadcast(true);
      debug('Sensor %s started on %s:%d', sensor.options.type,
        sensor._socket.address().address, sensor._socket.address().port);

      Object.keys(sensor.options.listeners).forEach(function(event) {
        debug('Bound %s event', event);
        sensor.on(event, function() {
          sensor.options.listeners[event].apply(this, arguments);
        });
      });

      sensor.startBeacon();
      if (cb) { cb(); }
    });
  }

  startBeacon() {
    var sensor = this;
    sensor.emit('startBeacon');
    sensor.startTime = process.uptime();
    sensor._beaconTimer = setInterval(function() {
      sensor.beacon.call(sensor);
    }, sensor.options.beaconInterval);
  }

  beacon() {
    this.emit('beacon');
    var buf = new Buffer(7);
    buf.fill(0xFF);
    var uptime = Math.round((process.uptime() - this.startTime) * 1000);
    buf.writeUInt8(MESSAGE_TYPE.BEACON, 0); // 1 byte
    buf.writeUInt8(this.options.typeCode, 1); // 1 byte
    buf.writeUInt32BE(uptime, 2); // 4 bytes
    buf.writeUInt8(this.status, 6); // 1 bytes
    debug('Sending Beacon: %s Type: 0x%s Uptime: %d Status: 0x%s',
      buf.toString('hex'), this.options.typeCode.toString(16), uptime,
      this.status.toString(16));
    this._socket.send(buf, 0, buf.length, this.options.broadcastPort,
      this.options.broadcastAddress);
  }

  stopBeacon() {
    this.emit('stopBeacon');
    clearInterval(this._beaconTimer);
    this._beaconTimer = null;
  }

  destroy() {
    this.emit('destroy');
    if (this._beaconTimer) { this.stopBeacon(); }
    this._socket.close();
  }

  _onMessage(msg, rinfo) {
    debug('Received %d bytes from %s:%d\n',
      msg.length, rinfo.address, rinfo.port);
    debug(msg);
    this.emit('message', msg, rinfo);

    // Parse with default parser
    var data = this.options.parsers.default(msg);

    // Then parse with eventType parse if exists
    if (this.options.parsers[data.type]) {
      data = this.options.parsers[data.type].call(this, msg);
    }

    // Then pass to hander
    if (this.options.handlers[data.type]) {
      this.options.handlers[data.type].call(this, data, rinfo);
    } else {
      this.options.handlers.default.call(this, data, rinfo);
    }
  }
};

util.inherits(module.exports, EventEmitter);
