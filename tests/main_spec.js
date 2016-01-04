var debug = require('debug')('Test:RemoteSensor');
var constants = require('../src/constants.js');
var chai = require('chai');
chai.should();

describe('RemoteSensor', function() {
  describe('#main', function() {
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

    it('should find and register the sensor', function(done) {
      this.timeout(5000);
      server = lib({
        singleton: false, autostart: false, port: sensor.options.broadcastPort,
      });
      server.once('newSensor', function() {
        server.once('beacon', function() {
          server.once('beacon', function(sensorDefinition) {
            debug('Beacon', sensorDefinition);
            sensorDefinition.new.should.be.equal(false);
            done();
          });
        });
      });
      server.listen();
    });

    it('should error when a cmd doesn\'t exist', function() {
      server = lib({
        singleton: false, autostart: false, port: sensor.options.broadcastPort,
      });

      (function() {
        server.run('notExistantCommand', {});
      }).should.throw(Error);
    });

    it('should autostart', function(done) {
      server = lib({
        singleton: false, autostart: true, port: sensor.options.broadcastPort,
      });
      server.once('newSensor', function(sensorDefinition) {
        debug('New Sensor Found', sensorDefinition);
        done();
      });
    });

    afterEach(function() {
      sensor.destroy();
      if (server) {server.stop();}
    });
  });
});
