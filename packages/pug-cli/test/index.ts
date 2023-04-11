'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var cp = require('child_process');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

// Sets directory to output coverage data to
// Incremented every time getRunner() is called.
var covCount = 1;
var isIstanbul = process.env.running_under_istanbul;

/*
 * I/O utilities for temporary directory.
 */
function j(paths) {
  return path.join.apply(path, paths);
}

function t(paths) {
  paths = Array.isArray(paths) ? paths : [paths];
  var args = [__dirname, 'temp'].concat(paths);
  return j(args);
}

function r(paths) {
  return fs.readFileSync(t(paths), 'utf8');
}

function rs(paths) {
  return fs.createReadStream(t(paths));
}

function w(paths, content) {
  return fs.writeFileSync(t(paths), content);
}

function a(paths, content) {
  return fs.appendFileSync(t(paths), content);
}

function u(paths) {
  return fs.unlinkSync(t(paths));
}

/**
 * Gets an array containing the routine to run the pug CLI. If this file is
 * being processed with istanbul then this function will return a routine
 * asking istanbul to store coverage data to a unique directory
 * (cov-pt<covCount>/).
 */
function getRunner() {
  var pugExe = j([__dirname, '..', 'index.js']);

  if (!isIstanbul) return [process.argv[0], [pugExe]];
  else {
    return [ 'istanbul',
             [ 'cover',
               '--print',  'none',
               '--report', 'none',
               '--root',   process.cwd(),
               '--dir',    process.cwd() + '/cov-pt' + (covCount++),
               pugExe,
               '--' ] ];
  }
}

/*
 * Run Pug CLI.
 *
 * @param  args     Array of arguments
 * @param [stdin]   Stream of standard input
 * @param  callback Function to call when the process finishes
 */
function run(args, stdin, callback) {
  if (arguments.length === 2) {
    callback = stdin;
    stdin    = null;
  }
  var runner = getRunner();
  var proc = cp.execFile(runner[0], runner[1].concat(args), {
    cwd: t([])
  }, callback);
  if (stdin) stdin.pipe(proc.stdin);
}

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

/*
 * Make temporary directories
 */
rimraf.sync(t([]));
mkdirp.sync(t(['_omittedDir']));
mkdirp.sync(t(['depwatch']));
mkdirp.sync(t(['inputs', 'level-1-1']));
mkdirp.sync(t(['inputs', 'level-1-2']));
mkdirp.sync(t(['outputs', 'level-1-1']));
mkdirp.sync(t(['outputs', 'level-1-2']));

/*
 * CLI utilities
 */
describe('miscellanea', function () {
  timing(this);
  it('--version', function (done) {
    run(['-V'], function (err, stdout) {
      if (err) done(err);
      assert.equal(stdout.trim(), 'pug version: ' + require('pug/package.json').version + '\npug-cli version: ' + require('../package.json').version);
      run(['--version'], function (err, stdout) {
        if (err) done(err);
        assert.equal(stdout.trim(), 'pug version: ' + require('pug/package.json').version + '\npug-cli version: ' + require('../package.json').version);
        done()
      });
    });
  });
  it('--help', function (done) {
    // only check that it doesn't crash
    run(['-h'], function (err, stdout) {
      if (err) done(err);
      run(['--help'], function (err, stdout) {
        if (err) done(err);
        done()
      });
    });
  });
  it('Omits files starting with an underscore', function (done) {
    w('_omitted.pug', '.foo bar');
    w('_omitted.html', '<p>output not written</p>');

    run(['_omitted.pug'], function (err) {
      if (err) return done(err);
      var html = r('_omitted.html');
      assert(html === '<p>output not written</p>');
      done();
    });
  });
  it('Omits directories starting with an underscore', function (done) {
    w('_omittedDir/file.pug', '.foo bar');
    w('_omittedDir/file.html', '<p>output not written</p>');

    run(['--no-debug', '_omittedDir/file.pug'], function (err, stdout) {
      if (err) return done(err);
      var html = r('_omittedDir/file.html');
      assert.equal(html, '<p>output not written</p>');
      done();
    });
  });
});

describe('HTML output', function () {
  timing(this);
  it('works', function (done) {
    w('input.pug', '.foo bar');
    w('input.html', '<p>output not written</p>');

    run(['--no-debug', 'input.pug'], function (err) {
      if (err) return done(err);
      var html = r('input.html');
      assert(html === '<div class="foo">bar</div>');
      done();
    });
  });
  it('--extension', function (done) {
    w('input.pug', '.foo bar');
    w('input.special-html', '<p>output not written</p>');

    run(['--no-debug', '-E', 'special-html', 'input.pug'], function (err) {
      if (err) return done(err);
      var html = r('input.special-html');
      assert(html === '<div class="foo">bar</div>');
      done();
    });
  });
  it('--basedir', function (done) {
    w('input.pug', 'extends /dependency1.pug');
    w('input.html', '<p>output not written</p>');
    run(['--no-debug', '-b', j([__dirname, 'dependencies']), 'input.pug'], function (err, stdout) {
      if (err) return done(err);
      var html = r('input.html');
      assert.equal(html, '<html><body></body></html>');
      done();
    });
  });
  context('--obj', function () {
    it('JavaScript syntax works', function (done) {
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--obj', "{'loc':'str'}", 'input.pug'], function (err) {
        if (err) return done(err);
        var html = r('input.html');
        assert(html === '<div class="foo">str</div>');
        done();
      });
    });
    it('JavaScript syntax does not accept UTF newlines', function (done) {
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--obj', "{'loc':'st\u2028r'}", 'input.pug'], function (err) {
        if (!err) return done(new Error('expecting error'));
        done();
      });
    });
    it('JSON syntax accept UTF newlines', function (done) {
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--obj', '{"loc":"st\u2028r"}', 'input.pug'], function (err) {
        if (err) return done(err);
        var html = r('input.html');
        assert.equal(html, '<div class="foo">st\u2028r</div>');
        done();
      });
    });
    it('JSON file', function (done) {
      w('obj.json', '{"loc":"str"}');
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--obj', 'obj.json', 'input.pug'], function (err) {
        if (err) return done(err);
        var html = r('input.html');
        assert(html === '<div class="foo">str</div>');
        done();
      });
    });
    it('JavaScript module', function (done) {
      w('obj.js', 'module.exports = {loc: "str"};');
      w('input.pug', '.foo= loc');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--obj', 'obj.js', 'input.pug'], function (err) {
        if (err) return done(err);
        var html = r('input.html');
        assert(html === '<div class="foo">str</div>');
        done();
      });
    });
  });
  it('stdio', function (done) {
    w('input.pug', '.foo bar');
    run(['--no-debug'], rs('input.pug'), function (err, stdout, stderr) {
      if (err) return done(err);
      assert(stdout === '<div class="foo">bar</div>');
      done();
    });
  });
  context('--out', function () {
    it('works', function (done) {
      w('input.pug', '.foo bar');
      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--out', 'outputs', 'input.pug'], function (err) {
        if (err) return done(err);
        var html = r(['outputs', 'input.html']);
        assert(html === '<div class="foo">bar</div>');
        done();
      });
    });
    it('works when input is a directory', function (done) {
      w(['inputs', 'input.pug'], '.foo bar 1');
      w(['inputs', 'level-1-1', 'input.pug'], '.foo bar 1-1');
      w(['inputs', 'level-1-2', 'input.pug'], '.foo bar 1-2');
      w(['outputs', 'input.html'], 'BIG FAT HEN 1');
      w(['outputs', 'level-1-1', 'input.html'], 'BIG FAT HEN 1-1');
      w(['outputs', 'level-1-2', 'input.html'], 'BIG FAT HEN 1-2');

      run(['--no-debug', '--hierarchy', '--out', 'outputs', 'inputs'], function (err) {
        if (err) return done(err);
        var html = r(['outputs', 'input.html']);
        assert(html === '<div class="foo">bar 1</div>');
        var html = r(['outputs', 'level-1-1', 'input.html']);
        assert(html === '<div class="foo">bar 1-1</div>');
        var html = r(['outputs', 'level-1-2', 'input.html']);
        assert(html === '<div class="foo">bar 1-2</div>');
        done();
      });
    });
  });
  it('--silent', function (done) {
    w('input.pug', '.foo bar');
    w('input.html', '<p>output not written</p>');
    run(['--no-debug', '-s', 'input.pug'], function (err, stdout) {
      if (err) return done(err);
      var html = r('input.html');
      assert.equal(html, '<div class="foo">bar</div>');
      assert.equal(stdout, '');

      w('input.html', '<p>output not written</p>');
      run(['--no-debug', '--silent', 'input.pug'], function (err, stdout) {
        if (err) return done(err);
        var html = r('input.html');
        assert.equal(html, '<div class="foo">bar</div>');
        assert.equal(stdout, '');
        done();
      });
    });
  });
});

describe('client JavaScript output', function () {
  timing(this);
  it('works', function (done) {
    w('input.pug', '.foo bar');
    w('input.js', 'throw new Error("output not written");');
    run(['--no-debug', '--client', 'input.pug'], function (err) {
      if (err) return done(err);
      var template = Function('', r('input.js') + ';return template;')();
      assert(template() === '<div class="foo">bar</div>');
      done();
    });
  });
  it('--name', function (done) {
    w('input.pug', '.foo bar');
    w('input.js', 'throw new Error("output not written");');
    run(['--no-debug', '--client', '--name', 'myTemplate', 'input.pug'], function (err) {
      if (err) return done(err);
      var template = Function('', r('input.js') + ';return myTemplate;')();
      assert(template() === '<div class="foo">bar</div>');
      done();
    });
  });
  it('--name --extension', function (done) {
    w('input.pug', '.foo bar');
    w('input.special-js', 'throw new Error("output not written");');
    run(['--no-debug', '--client', '-E', 'special-js', 'input.pug'], function (err) {
      if (err) return done(err);
      var template = Function('', r('input.special-js') + ';return template;')();
      assert(template() === '<div class="foo">bar</div>');
      done();
    });
  });
  it('stdio', function (done) {
    w('input.pug', '.foo bar');
    w('input.js', 'throw new Error("output not written");');
    run(['--no-debug', '--client'], rs('input.pug'), function (err, stdout) {
      if (err) return done(err);
      var template = Function('', stdout + ';return template;')();
      assert(template() === '<div class="foo">bar</div>');
      done();
    });
  });
  it('--name-after-file', function (done) {
    w('input-file.pug', '.foo bar');
    w('input-file.js', 'throw new Error("output not written");');
    run(['--no-debug', '--client', '--name-after-file', 'input-file.pug'], function (err, stdout, stderr) {
      if (err) return done(err);
      var template = Function('', r('input-file.js') + ';return inputFileTemplate;')();
      assert(template() === '<div class="foo">bar</div>');
      return done();
    });
  });
  it('--name-after-file ·InPuTwIthWEiRdNaMME.pug', function (done) {
    w('·InPuTwIthWEiRdNaMME.pug', '.foo bar');
    w('·InPuTwIthWEiRdNaMME.js', 'throw new Error("output not written");');
    run(['--no-debug', '--client', '--name-after-file', '·InPuTwIthWEiRdNaMME.pug'], function (err, stdout, stderr) {
      if (err) return done(err);
      var template = Function('', r('·InPuTwIthWEiRdNaMME.js') + ';return InputwithweirdnammeTemplate;')();
      assert(template() === '<div class="foo">bar</div>');
      return done();
    });
  });
});

describe('--watch', function () {
  var watchProc;
  var stdout = '';

  function cleanup() {
    stdout = '';
    if (!watchProc) return;

    watchProc.stderr.removeAllListeners('data');
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');
    watchProc.removeAllListeners('close');
  }

  after(function () {
    cleanup();
    watchProc.kill('SIGINT');
    watchProc = null;
  });

  beforeEach(cleanup);

  afterEach(function (done) {
    // pug --watch can only detect changes that are at least 1 second apart
    setTimeout(done, 1000);
  });

  it('pass 1: initial compilation', function (done) {
    timing(this);

    w('input-file.pug', '.foo bar');
    w('input-file.js', 'throw new Error("output not written (pass 1)");');
    var cmd = getRunner();
    cmd[1].push('--no-debug', '--client', '--name-after-file', '--watch', 'input-file.pug');
    watchProc = cp.spawn(cmd[0], cmd[1],  {
      cwd: t([])
    });

    watchProc.stdout.setEncoding('utf8');
    watchProc.stderr.setEncoding('utf8');
    watchProc.on('error', done);
    watchProc.stdout.on('data', function(buf) {
      stdout += buf;
      if (/rendered/.test(stdout)) {
        cleanup();

        var template = Function('', r('input-file.js') + ';return inputFileTemplate;')();
        assert(template() === '<div class="foo">bar</div>');

        return done();
      }
    });
  });
  it('pass 2: change the file', function (done) {
    w('input-file.js', 'throw new Error("output not written (pass 2)");');

    watchProc.on('error', done);
    watchProc.stdout.on('data', function(buf) {
      stdout += buf;
      if (/rendered/.test(stdout)) {
        cleanup();

        var template = Function('', r('input-file.js') + ';return inputFileTemplate;')();
        assert(template() === '<div class="foo">baz</div>');

        return done();
      }
    });

    w('input-file.pug', '.foo baz');
  });
  it('pass 3: remove the file then add it back', function (done) {
    w('input-file.js', 'throw new Error("output not written (pass 3)");');

    watchProc.on('error', done)
    watchProc.stdout.on('data', function(buf) {
      stdout += buf;
      if (/rendered/.test(stdout)) {
        cleanup();

        var template = Function('', r('input-file.js') + ';return inputFileTemplate;')();
        assert(template() === '<div class="foo">bat</div>');

        return done();
      }
    });

    u('input-file.pug');
    setTimeout(function () {
      w('input-file.pug', '.foo bat');
    }, 250);
  });
  it('pass 4: intentional errors in the pug file', function (done) {
    var stderr = '';
    var errored = false;

    watchProc.on('error', done);
    watchProc.on('close', function() {
      errored = true;
      return done(new Error('Pug should not terminate in watch mode'));
    });
    watchProc.stdout.on('data', function(buf) {
      stdout += buf;
      if (/rendered/.test(stdout)) {
        stdout = '';
        return done(new Error('Pug compiles an erroneous file w/o error'));
      }
    });
    watchProc.stderr.on('data', function(buf) {
      stderr += buf;
      if (!/Invalid indentation/.test(stderr)) return;
      stderr = '';
      var template = Function('', r('input-file.js') + ';return inputFileTemplate;')();
      assert(template() === '<div class="foo">bat</div>');

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

    w('input-file.pug', [
      'div',
      '  div',
      '\tarticle'
    ].join('\n'));
  });
});

describe('--watch with dependencies', function () {
  var watchProc;
  var stdout = '';

  before(function () {
    function copy(file) {
      w(['depwatch', file],
        fs.readFileSync(j([__dirname, 'dependencies', file])));
    }
    copy('include2.pug');
    copy('dependency2.pug');
    copy('dependency3.pug');
  });

  function cleanup() {
    stdout = '';

    if (!watchProc) return;

    watchProc.stderr.removeAllListeners('data');
    watchProc.stdout.removeAllListeners('data');
    watchProc.removeAllListeners('error');
    watchProc.removeAllListeners('close');
  }

  after(function () {
    cleanup();
    watchProc.kill('SIGINT');
    watchProc = null;
  });

  beforeEach(cleanup);

  afterEach(function (done) {
    // pug --watch can only detect changes that are at least 1 second apart
    setTimeout(done, 1000);
  });

  it('pass 1: initial compilation', function (done) {
    timing(this);

    w(['depwatch', 'include2.html'],    'output not written (pass 1)');
    w(['depwatch', 'dependency2.html'], 'output not written (pass 1)');
    var cmd = getRunner();
    cmd[1].push('--watch', 'include2.pug', 'dependency2.pug');
    watchProc = cp.spawn(cmd[0], cmd[1],  {
      cwd: t('depwatch')
    });

    watchProc.stdout.setEncoding('utf8');
    watchProc.stderr.setEncoding('utf8');
    watchProc.on('error', done);
    watchProc.stdout.on('data', function(buf) {
      stdout += buf;
      if ((stdout.match(/rendered/g) || []).length === 2) {
        cleanup();

        var output = r(['depwatch', 'include2.html']);
        assert.equal(output.trim(), '<strong>dependency3</strong>');
        output = r(['depwatch', 'dependency2.html']);
        assert.equal(output.trim(), '<strong>dependency3</strong>');

        return done();
      }
    });
  });
  it('pass 2: change a dependency', function (done) {
    timing(this);

    w(['depwatch', 'include2.html'],    'output not written (pass 2)');
    w(['depwatch', 'dependency2.html'], 'output not written (pass 2)');

    watchProc.on('error', done);
    watchProc.stdout.on('data', function(buf) {
      stdout += buf;
      if ((stdout.match(/rendered/g) || []).length === 2) {
        cleanup();

        var output = r(['depwatch', 'include2.html']);
        assert.equal(output.trim(), '<strong>dependency3</strong><p>Hey</p>');
        output = r(['depwatch', 'dependency2.html']);
        assert.equal(output.trim(), '<strong>dependency3</strong><p>Hey</p>');

        return done();
      }
    });

    a(['depwatch', 'dependency2.pug'], '\np Hey\n');
  });
  it('pass 3: change a deeper dependency', function (done) {
    timing(this);

    w(['depwatch', 'include2.html'],    'output not written (pass 3)');
    w(['depwatch', 'dependency2.html'], 'output not written (pass 3)');

    watchProc.on('error', done)
    watchProc.stdout.on('data', function(buf) {
      stdout += buf;
      if ((stdout.match(/rendered/g) || []).length === 2) {
        cleanup();

        var output = r(['depwatch', 'include2.html']);
        assert.equal(output.trim(), '<strong>dependency3</strong><p>Foo</p><p>Hey</p>');
        output = r(['depwatch', 'dependency2.html']);
        assert.equal(output.trim(), '<strong>dependency3</strong><p>Foo</p><p>Hey</p>');

        return done();
      }
    });

    a(['depwatch', 'dependency3.pug'], '\np Foo\n');
  });
  it('pass 4: change main file', function (done) {
    timing(this);

    w(['depwatch', 'include2.html'],    'output not written (pass 4)');
    w(['depwatch', 'dependency2.html'], 'output not written (pass 4)');

    watchProc.on('error', done);
    watchProc.stdout.on('data', function(buf) {
      stdout += buf;
      if ((stdout.match(/rendered/g) || []).length === 1) {
        cleanup();

        var output = r(['depwatch', 'include2.html']);
        assert.equal(output.trim(), '<strong>dependency3</strong><p>Foo</p><p>Hey</p><p>Baz</p>');
        output = r(['depwatch', 'dependency2.html']);
        assert.equal(output.trim(), 'output not written (pass 4)');

        return done();
      }
    });

    a(['depwatch', 'include2.pug'], '\np Baz\n');
  });
});
