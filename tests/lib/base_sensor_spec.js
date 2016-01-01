var debug = require('debug')('Test:BaseSensor');
var chai = require('chai');
chai.should();

describe('BaseSensor', function() {
  describe('#Constructor', function() {
    var sensor;
    var listener;

    beforeEach(function(done) {
      var BaseSensor = require('./base_sensor.js');
      var dgram = require('dgram');
      sensor = new BaseSensor({beaconInterval: 100});
      listener = dgram.createSocket(sensor.options.protocol);
      listener.bind(sensor.options.broadcastPort, done);
    });

    it('should start sending beacons', function(done) {
      listener.once('message', function(msg, rinfo) {
        debug('Received Beacon %s from %s:%d Type: 0x%s Uptime: %d Status: 0x%s',
          msg.toString('hex'), rinfo.address, rinfo.port,
          msg.readUInt8(0).toString(16), msg.readInt32BE(2),
          msg.readUInt8(6).toString(16));
        done();
      });
    });

    afterEach(function() {
      listener.close();
      sensor.destroy();
    });
  });
});
