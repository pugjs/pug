const assert = require('assert');
const fs = require('fs');
const runUtils = require('./run-utils');
const pug = require('../');

const anti = runUtils.findCases(__dirname + '/anti-cases');

describe('certain syntax is not allowed and will throw a compile time error', function () {
  anti.forEach(function(test){
    var name = test.replace(/[-.]/g, ' ');
    it(name, function(){
      var path = __dirname.replace(/\\/g, '/') + '/anti-cases/' + test + '.pug';
      var str = fs.readFileSync(path, 'utf8');
      try {
        var fn = pug.compile(str, {
          filename: path,
          pretty: true,
          basedir: __dirname + '/anti-cases',
          filters: runUtils.filters
        });
      } catch (ex) {
        if (!ex.code) {
          throw ex;
        }
        assert(ex instanceof Error, 'Should throw a real Error');
        assert(ex.code.indexOf('PUG:') === 0, 'It should have a code of "PUG:SOMETHING"');
        assert(ex.message.replace(/\\/g, '/').indexOf(path) === 0, 'it should start with the path');
        assert(/:\d+$/m.test(ex.message.replace(/\\/g, '/')), 'it should include a line number.');
        return;
      }
      throw new Error(test + ' should have thrown an error');
    })
  });
});
