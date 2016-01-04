var debug = require('debug')('Test:NFCSensor');
var chai = require('chai');
var constants = require('../../src/constants.js');
chai.should();

describe('NFCSensor', function() {
  describe('#Constructor', function() {
    var sensor;
    var listener;

    beforeEach(function(done) {
      var NFCSensor = require('./nfc_sensor.js');
      var dgram = require('dgram');
      sensor = new NFCSensor({beaconInterval: 10});
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

    it('should send a 4 byte card read', function(done) {
      var uid = (0xFFAC32F4).toString(16);
      listener.once('message', function(msg, rinfo) {
        var msgType = msg.readUInt8(0);
        var length = msg.readUInt8(1);
        var uid = msg.toString('hex', 2, length);

        msgType.should.be.equal(constants.MESSAGE_TYPE.ISO14443A_CARD_READ);

        debug('Received Card Read %s from %s:%d',
          msg.toString('hex'), rinfo.address, rinfo.port);

        length.should.be.equal(4);
        uid.should.be.equal(uid);

        done();
      });
      sensor.run('cardReadISO14443A', uid);
    });


    it('should send a 7 byte card read', function(done) {
      var uid = (0xFFACDE34AC32F4).toString(16);
      listener.once('message', function(msg, rinfo) {
        var msgType = msg.readUInt8(0);
        var length = msg.readUInt8(1);
        var uid = msg.toString('hex', 2, length);

        msgType.should.be.equal(constants.MESSAGE_TYPE.ISO14443A_CARD_READ);

        debug('Received Card Read %s from %s:%d',
          msg.toString('hex'), rinfo.address, rinfo.port);

        length.should.be.equal(7);
        uid.should.be.equal(uid);

        done();
      });
      sensor.run('cardReadISO14443A', uid);
    });

    it('should animate when sent animate command', function(done) {
      var animationId = 4;

      var animateCmd = new Buffer(2);
      animateCmd.writeUInt8(constants.MESSAGE_TYPE.ANIMATE, 0);
      animateCmd.writeUInt8(animationId, 1);

      sensor.on('animate', function(data) {
        data.should.be.equal(animationId);
        done();
      });

      listener.send(animateCmd, 0, animateCmd.length,
        sensor._socket.address().port, sensor._socket.address().address);
    });

    it('should stop animating when sent stop animate command', function(done) {
      var stopAnimateCmd = new Buffer(2);
      stopAnimateCmd.writeUInt8(constants.MESSAGE_TYPE.STOP_ANIMATE, 0);

      sensor.on('stopAnimate', done);

      listener.send(stopAnimateCmd, 0, stopAnimateCmd.length,
        sensor._socket.address().port, sensor._socket.address().address);
    });

    afterEach(function() {
      listener.close();
      sensor.destroy();
    });
  });
});
