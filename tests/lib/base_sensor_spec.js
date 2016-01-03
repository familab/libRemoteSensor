var debug = require('debug')('Test:BaseSensor');
var chai = require('chai');
var constants = require('../../src/constants.js');
chai.should();

describe('BaseSensor', function() {
  describe('#Constructor', function() {
    var sensor;
    var listener;

    beforeEach(function(done) {
      var BaseSensor = require('./base_sensor.js');
      var dgram = require('dgram');
      sensor = new BaseSensor({beaconInterval: 1000});
      listener = dgram.createSocket(sensor.options.protocol);
      listener.bind(sensor.options.broadcastPort, done);
    });

    it('should start sending beacons', function(done) {
      listener.once('message', function(msg, rinfo) {
        var msgType = msg.readUInt8(0);
        var sensorType = msg.readUInt8(1);
        var uptime = msg.readInt32BE(2);
        var status = msg.readUInt8(6);

        msgType.should.be.equal(constants.MESSAGE_TYPE.BEACON);

        debug('Received Beacon %s from %s:%d Type: 0x%s Uptime: %d ' +
          'Status: 0x%s',
          msg.toString('hex'), rinfo.address, rinfo.port,
          sensorType.toString(16), uptime, status.toString(16));

        sensorType.should.be.equal(sensor.options.typeCode);
        uptime.should.be.above(0);
        status.should.to.be.at.least(0);

        done();
      });
    });

    it('should reset when sent reset command', function(done) {
      var resetCmd = new Buffer(1);
      resetCmd.writeUInt8(constants.MESSAGE_TYPE.RESET);

      sensor.on('reset', done);

      listener.send(resetCmd, 0, resetCmd.length,
        sensor._socket.address().port, sensor._socket.address().address);
    });

    afterEach(function() {
      listener.close();
      sensor.destroy();
    });
  });
});
