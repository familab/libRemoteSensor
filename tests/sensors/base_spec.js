var debug = require('debug')('Test:RemoteSensor:Sensor:Base');
var chai = require('chai');
var constants = require('../../src/constants.js');
chai.should();

describe('RemoteSensor', function() {
  describe('#Base', function() {
    var BaseSensor = require('../lib/base_sensor.js');
    var lib = require('../../');
    var sensor;
    var server;

    beforeEach(function(done) {
      sensor = new BaseSensor({beaconInterval: 1000}, done);
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

    afterEach(function() {
      sensor.destroy();
      server.stop();
    });
  });
});
