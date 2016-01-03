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

      sensor.startBeacon();
      if (cb) { cb(); }
    });
  }

  startBeacon() {
    var sensor = this;
    sensor.emit('startBeacon');
    sensor._beaconTimer = setInterval(function() {
      sensor.beacon.call(sensor);
    }, sensor.options.beaconInterval);
  }

  beacon() {
    this.emit('beacon');
    var buf = new Buffer(10);
    buf.fill(0);
    var uptime = process.uptime() * 1000;
    buf.writeUInt8(MESSAGE_TYPE.BEACON);
    buf.writeUInt8(this.options.typeCode);
    buf.writeUInt32BE(uptime, 2);
    buf.writeUInt8(this.status, 6);
    debug('Sending Beacon: %s Type: 0x%s Uptime: %d Status: 0x%s',
      buf.toString('hex'), this.options.typeCode.toString(16), uptime,
      this.status.toString(16));
    this._socket.send(buf, 0, buf.length, this.options.broadcastPort,
      this.options.broadcastAddress);
  }

  stopBeacon() {
    this.emit('stopBeacon');
    clearInterval(this._beaconTimer);
  }

  destroy() {
    this.emit('destroy');
    this.stopBeacon();
    this._socket.close();
  }

  _onMessage(msg, rinfo) {
    debug('Received %d bytes from %s:%d\n',
      msg.length, rinfo.address, rinfo.port);
    debug(msg);
    this.emit('message', msg, rinfo);
  }
};

util.inherits(module.exports, EventEmitter);
