var debug = require('debug')('Test:RemoteSensor');
var constants = require('../src/constants.js');
var chai = require('chai');
chai.should();

describe('RemoteSensor', function() {
  describe('#main', function() {
    var sensor;
    var server;
    var lib = require('../');

    beforeEach(function() {
      server = lib({
        singleton: false, autostart: false,
      });
      var dgram = require('dgram');
      sensor = dgram.createSocket(server.options.type);
      sensor.bind(function() {
        sensor.setBroadcast(true);
      });
    });

    it('should handle an unknown message with the default handler',
      function(done) {
      var unknownData = 0x55;

      var unknownCmd = new Buffer(2);
      unknownCmd.writeUInt8(constants.MESSAGE_TYPE.UNKNOWN);
      unknownCmd.writeUInt8(unknownData, 1);

      server.once('message', function(data) {
        debug('Received unknown message', data);
        done();
      });
      server.listen(function() {
        debug('Sending unknown message 0x%s',
          unknownCmd.toString('hex'));
        sensor.send(unknownCmd, 0, unknownCmd.length,
          server.options.port, '255.255.255.255');
      });
    });

    afterEach(function() {
      sensor.close();
      if (server) {server.stop();}
    });
  });
});
