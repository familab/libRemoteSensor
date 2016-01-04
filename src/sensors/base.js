var constants = require('../constants.js');

module.exports = {
  type: 'BaseSensor',
  typeCode: constants.SENSOR_TYPES.BaseSensor,
  parsers: {
    default: function(msg, rinfo) {
      var data = {
        msg: msg.readUInt8(0),
        address: rinfo.address,
        port: rinfo.port,
      };

      // Lookup Sensor
      if (this.knownSensors[rinfo.address + ':' + rinfo.port]) {
        data.name = this.knownSensors[rinfo.address + ':' + rinfo.port].name;
        data.new = false;
      } else {
        data.new = true;
      }

      return data;
    },
    0x00: function beacon(data, msg) {
      return Object.assign(data, {
        type: msg.readUInt8(1),
        uptime: msg.readInt32BE(2),
        status: msg.readUInt8(6),
      });
    },
  },
  handlers: {
    default: function(data) {
      this.emit('message', data);
    },
    0x00: function beacon(data) {
      if (data.new) {
        this.emit('newSensor', data);
        this.emit('beacon', data);
      } else {
        this.emit('beacon', data);
      }
    },
  },
  methods: {
    reset: function() {
      var resetCmd = new Buffer(1);
      resetCmd.writeUInt8(constants.MESSAGE_TYPE.RESET);
      this._socket.send(resetCmd, 0, resetCmd.length,
        this.port, this.address);
    },
  },
};
