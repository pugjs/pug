'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var exec = require('child_process').exec;

function run(args, callback) {
  exec('node ' + JSON.stringify(path.resolve(__dirname + '/../bin/jade.js')) + ' ' + args, {
    cwd: __dirname + '/temp'
  }, callback);
}

try {
  fs.mkdirSync(__dirname + '/temp');
} catch (ex) {
  if (ex.code !== 'EEXIST') {
    throw ex;
  }
}

describe('command line', function () {
  it('jade --no-debug --client --name myTemplate input.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input.js', 'throw new Error("output not written");');
    run('--no-debug --client --name myTemplate input.jade', function (err) {
      if (err) return done(err);
      var template = Function('', fs.readFileSync(__dirname + '/temp/input.js', 'utf8') + ';return myTemplate;')();
      assert(template() === '<div class="foo">bar</div>');
      done();
    });
  });
  it('jade --no-debug --client --name-after-file input.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input.js', 'throw new Error("output not written");');
    run('--no-debug --client --name-after-file input.jade', function (err, stdout, stderr) {
      if (err) return done(err);
      var template = Function('', fs.readFileSync(__dirname + '/temp/input.js', 'utf8') + ';return inputTemplate;')();
      assert(template() === '<div class="foo">bar</div>');
      return done();
    });
  });
});
