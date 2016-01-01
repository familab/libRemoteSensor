var debug = require('debug')('Test:RemoteSensor:Loader');
var chai = require('chai');
chai.should();

describe('RemoteSensor', function() {
  describe('#Loader', function() {
    it('should return the same instance if called twice', function() {
      var lib = require('../');
      lib().should.equal(lib());
    });
    it('should return the a different instance if called with singleton false',
    function() {
      var lib = require('../');
      lib({singleton: false}).should.not.equal(lib({singleton: false}));
    });
  });
});
