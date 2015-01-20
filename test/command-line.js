'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var cp = require('child_process');

// Sets directory to output coverage data to
// Incremented every time getRunner() is called.
var covCount = 1;
var isIstanbul = process.env.running_under_istanbul;

/**
 * Gets an array containing the routine to run the jade CLI. If this file is
 * being processed with istanbul then this function will return a routine
 * asking istanbul to store coverage data to a unique directory
 * (cov-pt<covCount>/).
 */
function getRunner() {
  var jadeExe = __dirname + '/../bin/jade.js';

  if (!isIstanbul) return ['node', jadeExe];
  else {
    return ['istanbul', 'cover',
            '--print',  'none',
            '--report', 'none',
            '--root',   process.cwd(),
            '--dir',    process.cwd() + '/cov-pt' + (covCount++),
            jadeExe,
            '--'];
  }
}

function run(args, stdin, callback) {
  if (arguments.length === 2) {
    callback = stdin;
    stdin    = null;
  }
  var runner = getRunner().join(' ');
  cp.exec((stdin || '') + runner + ' ' + args, {
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
  if (isIstanbul) {
    this.timeout(11000);
    this.slow(9000);
  } else {
    this.slow(250);
  }
  it('jade --version', function (done) {
    run('-V', function (err, stdout) {
      if (err) done(err);
      assert.equal(stdout.trim(), require('../package.json').version);
      run('--version', function (err, stdout) {
        if (err) done(err);
        assert.equal(stdout.trim(), require('../package.json').version);
        done()
      });
    });
  });
  it('jade --help', function (done) {
    // only check that it doesn't crash
    run('-h', function (err, stdout) {
      if (err) done(err);
      run('--help', function (err, stdout) {
        if (err) done(err);
        done()
      });
    });
  });
});

describe('command line with HTML output', function () {
  if (isIstanbul) {
    this.timeout(8000);
    this.slow(6000);
  } else {
    this.slow(250);
  }
  it('jade --no-debug input.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input.html', '<p>output not written</p>');
    run('--no-debug input.jade', function (err) {
      if (err) return done(err);
      var html = fs.readFileSync(__dirname + '/temp/input.html', 'utf8');
      assert(html === '<div class="foo">bar</div>');
      done();
    });
  });
  it('jade --no-debug -E special-html input.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input.special-html', '<p>output not written</p>');
    run('--no-debug -E special-html input.jade', function (err) {
      if (err) return done(err);
      var html = fs.readFileSync(__dirname + '/temp/input.special-html', 'utf8');
      assert(html === '<div class="foo">bar</div>');
      done();
    });
  });
  it('jade --no-debug --obj "{\'loc\':\'str\'}" input.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo= loc');
    fs.writeFileSync(__dirname + '/temp/input.html', '<p>output not written</p>');
    run('--no-debug --obj "{\'loc\':\'str\'}" input.jade', function (err) {
      if (err) return done(err);
      var html = fs.readFileSync(__dirname + '/temp/input.html', 'utf8');
      assert(html === '<div class="foo">str</div>');
      done();
    });
  });
  it('jade --no-debug --obj "obj.json" input.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/obj.json', '{"loc":"str"}');
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo= loc');
    fs.writeFileSync(__dirname + '/temp/input.html', '<p>output not written</p>');
    run('--no-debug --obj "'+__dirname+'/temp/obj.json" input.jade', function (err) {
      if (err) return done(err);
      var html = fs.readFileSync(__dirname + '/temp/input.html', 'utf8');
      assert(html === '<div class="foo">str</div>');
      done();
    });
  });
  it('cat input.jade | jade --no-debug', function (done) {
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo bar');
    run('--no-debug', 'cat input.jade | ', function (err, stdout, stderr) {
      if (err) return done(err);
      assert(stdout === '<div class="foo">bar</div>');
      done();
    });
  });
});

describe('command line with client JS output', function () {
  if (isIstanbul) {
    this.timeout(8000);
    this.slow(6000);
  } else {
    this.slow(250);
  }
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
  it('jade --no-debug --client -E special-js --name myTemplate input.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input.special-js', 'throw new Error("output not written");');
    run('--no-debug --client -E special-js --name myTemplate input.jade', function (err) {
      if (err) return done(err);
      var template = Function('', fs.readFileSync(__dirname + '/temp/input.special-js', 'utf8') + ';return myTemplate;')();
      assert(template() === '<div class="foo">bar</div>');
      done();
    });
  });
  it('cat input.jade | jade --no-debug --client --name myTemplate', function (done) {
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input.js', 'throw new Error("output not written");');
    run('--no-debug --client --name myTemplate', 'cat input.jade | ', function (err, stdout) {
      if (err) return done(err);
      var template = Function('', stdout + ';return myTemplate;')();
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
    // Just to be sure
    watchProc.stderr.removeAllListeners('data');
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');
    watchProc.removeAllListeners('close');

    watchProc.kill('SIGINT');
  });
  afterEach(function (done) {
    // jade --watch can only detect changes that are at least 1 second apart
    setTimeout(done, 1000);
  });
  it('jade --no-debug --client --name-after-file --watch input-file.jade (pass 1)', function (done) {
    if (isIstanbul) {
      this.timeout(8000);
      this.slow(6000);
    } else {
      this.slow(300);
    }
    fs.writeFileSync(__dirname + '/temp/input-file.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input-file.js', 'throw new Error("output not written (pass 1)");');
    var cmd = getRunner();
    cmd.push.apply(cmd,
      ['--no-debug', '--client', '--name-after-file', '--watch', 'input-file.jade']);
    watchProc = cp.spawn(cmd[0], cmd.slice(1),  {
      cwd: __dirname + '/temp'
    });

    watchProc.stdout.setEncoding('utf8');
    watchProc.stderr.setEncoding('utf8');
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
    // Just to be sure
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');

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
  it('jade --no-debug --client --name-after-file --watch input-file.jade (intentional errors in the jade file)', function (done) {
    // Just to be sure
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');

    var stderr = '';
    var errored = false;
    watchProc
      .on('error', done)
      .on('close', function() {
        errored = true;
        return done(new Error('Jade should not terminate in watch mode'));
      })
      .stdout.on('data', function(buf) {
        stdout += buf;
        if (/.*rendered.*/.test(stdout)) {
          stdout = '';
          return done(new Error('Jade compiles an erroneous file w/o error'));
        }
      })
    watchProc
      .stderr.on('data', function(buf) {
        stderr += buf;
        if (!/.*Invalid indentation.*/.test(stderr)) return;
        stderr = '';
        var template = Function('', fs.readFileSync(__dirname + '/temp/input-file.js', 'utf8') + ';return inputFileTemplate;')();
        assert(template() === '<div class="foo">baz</div>');

        watchProc.stderr.removeAllListeners('data');
        watchProc.stdout.removeAllListeners('data');
        watchProc.removeAllListeners('error');
        watchProc.removeAllListeners('exit');
        // The stderr event will always fire sooner than the close event.
        // Wait for it.
        setTimeout(function() {
          if (!errored) done();
        }, 100);
      });
    fs.writeFileSync(__dirname + '/temp/input-file.jade',
                     fs.readFileSync(__dirname
                                     + '/anti-cases/tabs-and-spaces.jade'));
  });
});
