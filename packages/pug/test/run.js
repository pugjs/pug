
/**
 * Module dependencies.
 */

var fs = require('fs');
var assert = require('assert');
var pug = require('../');
var uglify = require('uglify-js');
var mkdirp = require('mkdirp').sync;

var filters = {
  custom: function (str, options) {
    assert(options.opt === 'val');
    assert(options.num === 2);
    return 'BEGIN' + str + 'END';
  }
};

// test cases

function findCases(dir) {
  return fs.readdirSync(dir).filter(function(file){
    return ~file.indexOf('.pug');
  }).map(function(file){
    return file.replace('.pug', '');
  });
}

var cases = findCases(__dirname + '/cases');
var es2015 = findCases(__dirname + '/cases-es2015');
var anti = findCases(__dirname + '/anti-cases');

mkdirp(__dirname + '/output');
mkdirp(__dirname + '/output-es2015');

function testSingle(it, suffix, test){
  var name = test.replace(/[-.]/g, ' ');
  it(name, function(){
    var path = 'test/cases' + suffix + '/' + test + '.pug';
    var str = fs.readFileSync(path, 'utf8');
    var fn = pug.compile(str, {
      filename: path,
      pretty: true,
      basedir: 'test/cases' + suffix,
      filters: filters
    });
    var actual = fn({ title: 'Pug' });

    fs.writeFileSync(__dirname + '/output' + suffix + '/' + test + '.html', actual);

    var html = fs.readFileSync('test/cases' + suffix + '/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
    var clientCode = uglify.minify(pug.compileClient(str, {
      filename: path,
      pretty: true,
      compileDebug: false,
      basedir: 'test/cases' + suffix,
      filters: filters
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code;
    var clientCodeDebug = uglify.minify(pug.compileClient(str, {
      filename: path,
      pretty: true,
      compileDebug: true,
      basedir: 'test/cases' + suffix,
      filters: filters
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code;
    fs.writeFileSync(__dirname + '/output' + suffix + '/' + test + '.js', uglify.minify(pug.compileClient(str, {
      filename: path,
      pretty: false,
      compileDebug: false,
      basedir: 'test/cases' + suffix,
      filters: filters
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code);
    if (/filter/.test(test)) {
      actual = actual.replace(/\n| /g, '');
      html = html.replace(/\n| /g, '');
    }
    if (/mixins-unused/.test(test)) {
      assert(/never-called/.test(str), 'never-called is in the pug file for mixins-unused');
      assert(!/never-called/.test(clientCode), 'never-called should be removed from the code');
    }
    JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
    actual = Function('pug', clientCode + '\nreturn template;')()({ title: 'Pug' });
    if (/filter/.test(test)) {
      actual = actual.replace(/\n| /g, '');
    }
    JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
    actual = Function('pug', clientCodeDebug + '\nreturn template;')()({ title: 'Pug' });
    if (/filter/.test(test)) {
      actual = actual.replace(/\n| /g, '');
    }
    JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
  });
}

describe('test cases', function () {
  cases.forEach(testSingle.bind(null, it, ''));
});

describe('test cases for ECMAScript 2015', function () {
  try {
    eval('``');
    es2015.forEach(testSingle.bind(null, it, '-es2015'));
  } catch (ex) {
    es2015.forEach(testSingle.bind(null, it.skip, '-es2015'));
  }
});

describe('certain syntax is not allowed and will throw a compile time error', function () {
  anti.forEach(function(test){
    var name = test.replace(/[-.]/g, ' ');
    it(name, function(){
      var path = 'test/anti-cases/' + test + '.pug';
      var str = fs.readFileSync(path, 'utf8');
      try {
        var fn = pug.compile(str, {
          filename: path,
          pretty: true,
          basedir: 'test/anti-cases',
          filters: filters
        });
      } catch (ex) {
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
