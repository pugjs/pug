'use strict';

var pug = require('../');
var pugLoad = require('../../pug-load');
var assert = require('assert');
var fs = require('fs');

describe('plugin options', function () {
  it('should list the filename of the template referenced by extends', function(){
    var filename = __dirname + '/dependencies/extends1.pug';
    var str = fs.readFileSync(filename, 'utf8');
    var pugLoadPlugin = {
      resolve: (filename, source, options) => {
        assert(options.pluginOptions !== undefined);
        assert(options.pluginOptions.test === 'something');
        return pugLoad.resolve(filename, source, options);
      }
    }
    const options = {
      plugins: [
        pugLoadPlugin
      ],
      filename: filename,
      pluginOptions: {
        test: 'something'
      }
    };

    pug.compile(str, options);
  });
});
