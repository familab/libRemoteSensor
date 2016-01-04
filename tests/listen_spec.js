var debug = require('debug')('Test:RemoteSensor');
var chai = require('chai');
chai.should();

describe('RemoteSensor', function() {
  describe('#listen', function() {
    var sensor;
    var server;
    var lib = require('../');

    beforeEach(function(done) {
      var BaseSensor = require('./lib/base_sensor.js');
      sensor = new BaseSensor({beaconInterval: 500}, done);
    });

    it('should find the sensor', function(done) {
      server = lib({
        singleton: false, autostart: false, port: sensor.options.broadcastPort,
      });
      server.once('newSensor', function(sensorDefinition) {
        debug('New Sensor Found', sensorDefinition);
        done();
      });
      server.listen();
    });

    afterEach(function() {
      sensor.destroy();
      if (server) {server.stop();}
    });
  });
});
