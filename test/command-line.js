'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
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

rimraf.sync(__dirname + '/temp');
mkdirp.sync(__dirname + '/temp/depwatch');
mkdirp.sync(__dirname + '/temp/inputs/level-1-1');
mkdirp.sync(__dirname + '/temp/inputs/level-1-2');
mkdirp.sync(__dirname + '/temp/outputs/level-1-1');
mkdirp.sync(__dirname + '/temp/outputs/level-1-2');

/**
 * Set timing limits for a test case
 */
function timing(testCase) {
  if (isIstanbul) {
    testCase.timeout(20000);
    testCase.slow(3000);
  } else {
    testCase.timeout(12500);
    testCase.slow(2000);
  }
}

describe('command line', function () {
  timing(this);
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
  timing(this);
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
  it('jade --no-debug --out outputs input.jade', function (done) {
    fs.writeFileSync(__dirname + '/temp/input.jade', '.foo bar');
    fs.writeFileSync(__dirname + '/temp/input.html', '<p>output not written</p>');
    run('--no-debug --out outputs input.jade', function (err) {
      if (err) return done(err);
      var html = fs.readFileSync(__dirname + '/temp/outputs/input.html', 'utf8');
      assert(html === '<div class="foo">bar</div>');
      done();
    });
  });
  context('when input is directory', function () {
    it('jade --no-debug --out outputs inputs', function (done) {
      fs.writeFileSync(__dirname + '/temp/inputs/input.jade', '.foo bar 1');
      fs.writeFileSync(__dirname + '/temp/inputs/level-1-1/input1-1.jade', '.foo bar 1-1');
      fs.writeFileSync(__dirname + '/temp/inputs/level-1-2/input1-2.jade', '.foo bar 1-2');
      fs.writeFileSync(__dirname + '/temp/outputs/input.html', 'BIG FAT HEN 1');
      fs.writeFileSync(__dirname + '/temp/outputs/input1-1.html', 'BIG FAT HEN 1-1');
      fs.writeFileSync(__dirname + '/temp/outputs/input1-2.html', 'BIG FAT HEN 1-2');
      run('--no-debug --out outputs inputs', function (err, stdout, stderr) {
        if (err) return done(err);
        var html = fs.readFileSync(__dirname + '/temp/outputs/input.html', 'utf8');
        assert(html === '<div class="foo">bar 1</div>');
        var html = fs.readFileSync(__dirname + '/temp/outputs/input1-1.html', 'utf8');
        assert(html === '<div class="foo">bar 1-1</div>');
        var html = fs.readFileSync(__dirname + '/temp/outputs/input1-2.html', 'utf8');
        assert(html === '<div class="foo">bar 1-2</div>');
        assert(stderr.indexOf('--hierarchy will become the default') !== -1,
               '--hierarchy default warning not shown');
        done();
      });
    });
    it('jade --no-debug --hierarchy --out outputs inputs', function (done) {
      fs.writeFileSync(__dirname + '/temp/inputs/input.jade', '.foo bar 1');
      fs.writeFileSync(__dirname + '/temp/inputs/level-1-1/input.jade', '.foo bar 1-1');
      fs.writeFileSync(__dirname + '/temp/inputs/level-1-2/input.jade', '.foo bar 1-2');
      fs.writeFileSync(__dirname + '/temp/outputs/input.html', 'BIG FAT HEN 1');
      fs.writeFileSync(__dirname + '/temp/outputs/level-1-1/input.html', 'BIG FAT HEN 1-1');
      fs.writeFileSync(__dirname + '/temp/outputs/level-1-2/input.html', 'BIG FAT HEN 1-2');
      run('--no-debug --hierarchy --out outputs inputs', function (err) {
        if (err) return done(err);
        var html = fs.readFileSync(__dirname + '/temp/outputs/input.html', 'utf8');
        assert(html === '<div class="foo">bar 1</div>');
        var html = fs.readFileSync(__dirname + '/temp/outputs/level-1-1/input.html', 'utf8');
        assert(html === '<div class="foo">bar 1-1</div>');
        var html = fs.readFileSync(__dirname + '/temp/outputs/level-1-2/input.html', 'utf8');
        assert(html === '<div class="foo">bar 1-2</div>');
        done();
      });
    });
  });
});

describe('command line with client JS output', function () {
  timing(this);
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
    if (!watchProc) return
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
    timing(this);
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

describe('command line watch mode with dependencies', function () {
  var watchProc;
  var stdout = '';
  after(function() {
    if (!watchProc) return
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
  it('jade --watch include2.jade dependency2.jade (pass 1)', function (done) {
    timing(this);
    function copy (file) {
      fs.writeFileSync(__dirname + '/temp/depwatch/' + file,
        fs.readFileSync(__dirname + '/dependencies/' + file));
    }
    copy('include2.jade');
    copy('dependency2.jade');
    copy('dependency3.jade');
    fs.writeFileSync(__dirname + '/temp/depwatch/include2.html',    'output not written (pass 1)');
    fs.writeFileSync(__dirname + '/temp/depwatch/dependency2.html', 'output not written (pass 1)');
    var cmd = getRunner();
    cmd.push('--watch', 'include2.jade', 'dependency2.jade');
    watchProc = cp.spawn(cmd[0], cmd.slice(1),  {
      cwd: __dirname + '/temp/depwatch'
    });

    watchProc.stdout.setEncoding('utf8');
    watchProc.stderr.setEncoding('utf8');
    watchProc
      .on('error', done)
      .stdout.on('data', function(buf) {
        stdout += buf;
        if ((stdout.match(/rendered/g) || []).length === 2) {
          stdout = '';

          var output = fs.readFileSync(__dirname + '/temp/depwatch/include2.html', 'utf8');
          assert.equal(output.trim(), '<strong>dependency3</strong>');
          output = fs.readFileSync(__dirname + '/temp/depwatch/dependency2.html', 'utf8');
          assert.equal(output.trim(), '<strong>dependency3</strong>');

          watchProc.stdout.removeAllListeners('data');
          watchProc.removeAllListeners('error');
          return done();
        }
      });
  });
  it('jade --watch include2.jade dependency2.jade (pass 2)', function (done) {
    timing(this);
    // Just to be sure
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');

    fs.writeFileSync(__dirname + '/temp/depwatch/include2.html',    'output not written (pass 2)');
    fs.writeFileSync(__dirname + '/temp/depwatch/dependency2.html', 'output not written (pass 2)');

    watchProc
      .on('error', done)
      .stdout.on('data', function(buf) {
        stdout += buf;
        if ((stdout.match(/rendered/g) || []).length === 2) {
          stdout = '';

          var output = fs.readFileSync(__dirname + '/temp/depwatch/include2.html', 'utf8');
          assert.equal(output.trim(), '<strong>dependency3</strong><p>Hey</p>');
          output = fs.readFileSync(__dirname + '/temp/depwatch/dependency2.html', 'utf8');
          assert.equal(output.trim(), '<strong>dependency3</strong><p>Hey</p>');

          watchProc.stdout.removeAllListeners('data');
          watchProc.removeAllListeners('error');
          return done();
        }
      });
    fs.appendFileSync(__dirname + '/temp/depwatch/dependency2.jade', '\np Hey\n');
  });
  it('jade --watch include2.jade dependency2.jade (pass 3)', function (done) {
    timing(this);
    // Just to be sure
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');

    fs.writeFileSync(__dirname + '/temp/depwatch/include2.html',    'output not written (pass 3)');
    fs.writeFileSync(__dirname + '/temp/depwatch/dependency2.html', 'output not written (pass 3)');

    watchProc
      .on('error', done)
      .stdout.on('data', function(buf) {
        stdout += buf;
        if ((stdout.match(/rendered/g) || []).length === 2) {
          stdout = '';

          var output = fs.readFileSync(__dirname + '/temp/depwatch/include2.html', 'utf8');
          assert.equal(output.trim(), '<strong>dependency3</strong><p>Foo</p><p>Hey</p>');
          output = fs.readFileSync(__dirname + '/temp/depwatch/dependency2.html', 'utf8');
          assert.equal(output.trim(), '<strong>dependency3</strong><p>Foo</p><p>Hey</p>');

          watchProc.stdout.removeAllListeners('data');
          watchProc.removeAllListeners('error');
          return done();
        }
      });
    fs.appendFileSync(__dirname + '/temp/depwatch/dependency3.jade', '\np Foo\n');
  });
  it('jade --watch include2.jade dependency2.jade (pass 4)', function (done) {
    timing(this);
    // Just to be sure
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');

    fs.writeFileSync(__dirname + '/temp/depwatch/include2.html',    'output not written (pass 4)');
    fs.writeFileSync(__dirname + '/temp/depwatch/dependency2.html', 'output not written (pass 4)');

    watchProc
      .on('error', done)
      .stdout.on('data', function(buf) {
        stdout += buf;
        if ((stdout.match(/rendered/g) || []).length === 1) {
          stdout = '';

          var output = fs.readFileSync(__dirname + '/temp/depwatch/include2.html', 'utf8');
          assert.equal(output.trim(), '<strong>dependency3</strong><p>Foo</p><p>Hey</p><p>Baz</p>');
          output = fs.readFileSync(__dirname + '/temp/depwatch/dependency2.html', 'utf8');
          assert.equal(output.trim(), 'output not written (pass 4)');

          watchProc.stdout.removeAllListeners('data');
          watchProc.removeAllListeners('error');
          return done();
        }
      });
    fs.appendFileSync(__dirname + '/temp/depwatch/include2.jade', '\np Baz\n');
  });
});
