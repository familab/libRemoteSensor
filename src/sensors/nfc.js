var constants = require('../constants.js');

module.exports = {
  type: 'NFCSensor',
  typeCode: constants.SENSOR_TYPES.NFCSensor,
  parsers: {
    0xA0: function cardReadISO14443A(data, msg) {
      var length = Math.min(7, msg.readUInt8(1));
      var uid = msg.toString('hex', 2, length);
      return Object.assign(data, {
        uidLength: length,
        uid: uid,
      });
    },
  },
  handlers: {
    0xA0: function(data) {
      this.emit('cardReadISO14443A', data);
    },
  },
  methods: {
    animate: function(animationId) {
      var animateCmd = new Buffer(2);
      animateCmd.writeUInt8(constants.MESSAGE_TYPE.ANIMATE, 0);
      animateCmd.writeUInt8(animationId, 1);
      this._socket.send(animateCmd, 0, animateCmd.length,
        this.port, this.address);
    },
    stopAnimate: function() {
      var stopAnimateCmd = new Buffer(1);
      stopAnimateCmd.writeUInt8(constants.MESSAGE_TYPE.STOP_ANIMATE);
      this._socket.send(stopAnimateCmd, 0, stopAnimateCmd.length,
        this.port, this.address);
    },
  },
};
