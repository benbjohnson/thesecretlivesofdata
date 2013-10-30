describe('TSLD', function(){

  var Tsld = require('tsld/lib/tsld')
    , assert = require('assert')
    , equals = require('equals');

  var tsld = null;
  beforeEach(function() {
    tsld = new Tsld();
  });

  describe('#initialize()', function(){
    it('should be initialized', function(){
      tsld.initialize();
      assert(tsld.initialized == true);
    });
  });
});
