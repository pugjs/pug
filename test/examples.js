'use strict';

var fs = require('fs');
var jade = require('../');

describe('examples', function () {
  fs.readdirSync(__dirname + '/../examples').forEach(function (example) {
    if (/\.js$/.test(example)) {
      it(example + ' does not throw any error', function () {
        var log = console.log;
        var err = console.error;
        console.log = function () {};
        console.error = function () {};
        try {
          require('../examples/' + example);
        } catch (ex) {
          console.log = log;
          console.error = err;
          throw ex;
        }
        console.log = log;
        console.error = err;
      });
    }
  });
});
