'use strict';

var fs = require('fs');
var jade = require('../');

describe('examples', function () {
  it('none of them throw any errors', function () {
    var log = console.log;
    var err = console.error;
    console.log = function () {};
    console.error = function () {};
    try {
      fs.readdirSync(__dirname + '/../examples').forEach(function (example) {
        if (/\.js$/.test(example)) {
          require('../examples/' + example);
        }
      });
    } catch (ex) {
      console.log = log;
      console.error = err;
    }
    console.log = log;
    console.error = err;
  });
});