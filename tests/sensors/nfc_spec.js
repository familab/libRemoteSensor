var debug = require('debug')('Test:RemoteSensor:Sensor:NFC');
var chai = require('chai');
var constants = require('../../src/constants.js');
chai.should();

describe('RemoteSensor', function() {
  describe('#NFC', function() {
    var NFCSensor = require('../lib/nfc_sensor.js');
    var lib = require('../../');
    var sensor;
    var server;

    beforeEach(function(done) {
      sensor = new NFCSensor({beaconInterval: 1000}, done);
      server = lib({singleton: false, autostart: false});
    });

    it('should receive a beacon', function(done) {
      server.once('beacon', function(data) {
        data.port.should.equal(sensor._socket.address().port);
        done();
      });
      server.listen();
    });

    it('should reset', function(done) {
      var sensorDefinition = {
        type: sensor.options.typeCode,
        port: sensor._socket.address().port,
        address: sensor._socket.address().address,
      };

      sensor.once('reset', done);
      server.run('reset', sensorDefinition);
    });

    it('should send a 4 byte card read', function(done) {
      var uid = (0xFFAC32F4).toString(16);

      server.once('cardReadISO14443A', function(data) {
        data.should.equal(uid);
        done();
      });

      server.listen(function() {
        sensor.run('cardReadISO14443A', uid);
      });
    });

    it('should send a 7 byte card read', function(done) {
      var uid = (0xFFACDE34AC32F4).toString(16);

      server.once('cardReadISO14443A', function(data) {
        data.should.equal(uid);
        done();
      });

      server.listen(function() {
        sensor.run('cardReadISO14443A', uid);
      });
    });

    it('should animate', function(done) {
      var animationId = 4;
      var sensorDefinition = {
        type: sensor.options.typeCode,
        port: sensor._socket.address().port,
        address: sensor._socket.address().address,
      };

      sensor.once('animate', function(data) {
        data.should.equal(animationId);
        done();
      });
      server.run('animate', sensorDefinition, [animationId]);
    });

    it('should stop animate', function(done) {
      var sensorDefinition = {
        type: sensor.options.typeCode,
        port: sensor._socket.address().port,
        address: sensor._socket.address().address,
      };

      sensor.once('stopAnimate', done);
      server.run('stopAnimate', sensorDefinition);
    });

    afterEach(function() {
      sensor.destroy();
      server.stop();
    });
  });
});
