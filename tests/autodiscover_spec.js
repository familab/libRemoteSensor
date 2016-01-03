var debug = require('debug')('Test:RemoteSensor');
var chai = require('chai');
chai.should();

describe('RemoteSensor', function() {
  describe('#autoDiscover', function() {
    var sensor;
    var lib;

    beforeEach(function(done) {
      var BaseSensor = require('./lib/base_sensor.js');
      sensor = new BaseSensor({beaconInterval: 1000}, done);
    });

    it('should find the sensor', function(done) {
      lib = require('../')({
        singleton: false, autostart: false, port: sensor.options.broadcastPort,
      });
      lib.once('newSensor', function(sensorDefinition) {
        debug('New Sensor Found', sensorDefinition);
        done();
      });
      lib.autoDiscover();
    });

    afterEach(function() {
      sensor.destroy();
      if (lib) {lib.stop();}
    });
  });
});
