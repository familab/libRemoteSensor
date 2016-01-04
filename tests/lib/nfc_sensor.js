var debug = require('debug')('NFCSensor');
var util = require('util');

var BaseSensor = require('./base_sensor.js');
var constants = require('../../src/constants.js');

var STATUS_CODE = constants.STATUS_CODE;
var MESSAGE_TYPE = constants.MESSAGE_TYPE;

var defaultOptions = {
  type: 'NFCSensor',
  typeCode: 0x01,
  parsers: {
    0xD0: function animate(msg) {
      return {
        type: msg.readUInt8(0),
        animationId: msg.readUInt8(1),
      };
    },
  },
  handlers: {
    0xD0: function animate(data, rinfo) {
      debug('Received animate command from %s:%d\n', rinfo.address, rinfo.port);
      this.emit('animate', data.animationId);
    },
  },
  methods: {
    cardReadISO14443A(uid) {
      // UID is 4 bytes (Mifare Classic)
      // or 7 bytes (Mifare Ultralight)
      this.emit('cardReadISO14443A');
      var uidBytes = Math.min(uid.length / 2, 7);
      var buf = new Buffer(uidBytes + 2);
      buf.writeUInt8(MESSAGE_TYPE.ISO14443A_CARD_READ, 0); // 1 byte
      buf.writeUInt8(uidBytes, 1); // 1 byte
      buf.write(uid, 2, uidBytes, 'hex');

      debug('Sending Card Read: %s ',
        buf.toString('hex'));
      this._socket.send(buf, 0, buf.length, this.options.broadcastPort,
        this.options.broadcastAddress);
    },
  },
};

/**
 * Class NFC Sensor
 *
 * Class that impliments a NFC sensor.
 *
 * @type NFCSensor
 */
var NFCSensor = module.exports = class NFCSensor extends BaseSensor {
  constructor(startupOptions, cb) {
    var options = Object.assign({}, defaultOptions, startupOptions);
    Object.assign(options.handlers || {}, defaultOptions.handlers || {},
      startupOptions.handlers);
    Object.assign(options.parsers || {}, defaultOptions.parsers || {},
      startupOptions.parsers);
    Object.assign(options.listeners || {}, defaultOptions.listeners || {},
      startupOptions.listeners);
    Object.assign(options.methods || {}, defaultOptions.methods || {},
      startupOptions.methods);

    super(options);
  }
};
