'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var cp = require('child_process');

function run(args, stdin, callback) {
  if (arguments.length === 2) {
    callback = stdin;
    stdin    = null;
  }
  cp.exec((stdin || '') + 'node ' + JSON.stringify(path.resolve(__dirname + '/../bin/jade.js')) + ' ' + args, {
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
  it('jade --no-debug --client --name-after-file input-file.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/input-file.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input-file.js', 'throw new Error("output not written");');
    run('--no-debug --client --name-after-file input-file.jade', function (err, stdout, stderr) {
      if (err) return done(err);
      var template = Function('', fs.readFileSync(__dirname + '/temp/input-file.js', 'utf8') + ';return inputFileTemplate;')();
      assert(template() === '<div class="foo">bar</div>');
      return done();
    });
  });
  it('jade --no-debug --client --name-after-file _InPuTwIthWEiRdNaMME.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/_InPuTwIthWEiRdNaMME.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/_InPuTwIthWEiRdNaMME.js', 'throw new Error("output not written");');
    run('--no-debug --client --name-after-file _InPuTwIthWEiRdNaMME.jade', function (err, stdout, stderr) {
      if (err) return done(err);
      var template = Function('', fs.readFileSync(__dirname + '/temp/_InPuTwIthWEiRdNaMME.js', 'utf8') + ';return InputwithweirdnammeTemplate;')();
      assert(template() === '<div class="foo">bar</div>');
      return done();
    });
  });
});

describe('command line watch mode', function () {
  var watchProc;
  var stdout = '';
  after(function() {
    watchProc.kill('SIGINT');
  });
  it('jade --no-debug --client --name-after-file --watch input-file.jade (pass 1)', function (done) {
    fs.writeFileSync(__dirname + '/temp/input-file.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input-file.js', 'throw new Error("output not written (pass 1)");');
    var args = [__dirname + '/../bin/jade.js', '--no-debug', '--client', '--name-after-file', '--watch', 'input-file.jade']
    watchProc = cp.spawn('node', args,  {
      cwd: __dirname + '/temp'
    });

    watchProc.stdout.setEncoding('utf8');
    watchProc
      .on('error', done)
      .stdout.on('data', function(buf) {
        stdout += buf;
        if (/.*rendered.*/.test(stdout)) {
          stdout = '';
          var template = Function('', fs.readFileSync(__dirname + '/temp/input-file.js', 'utf8') + ';return inputFileTemplate;')();
          assert(template() === '<div class="foo">bar</div>');

          watchProc.stdout.removeAllListeners('data');
          watchProc.removeAllListeners('error');
          return done();
        }
      });
  });
  it('jade --no-debug --client --name-after-file --watch input-file.jade (pass 2)', function (done) {
    fs.writeFileSync(__dirname + '/temp/input-file.js', 'throw new Error("output not written (pass 2)");');
    fs.writeFileSync(__dirname + '/temp/input-file.jade', '.foo baz');

    watchProc
      .on('error', done)
      .stdout.on('data', function(buf) {
        stdout += buf;
        if (/.*rendered.*/.test(stdout)) {
          stdout = '';
          var template = Function('', fs.readFileSync(__dirname + '/temp/input-file.js', 'utf8') + ';return inputFileTemplate;')();
          assert(template() === '<div class="foo">baz</div>');

          watchProc.stdout.removeAllListeners('data');
          watchProc.removeAllListeners('error');
          return done();
        }
      });
  });
});
