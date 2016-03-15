
/**
 * Module dependencies.
 */

var fs = require('fs');
var assert = require('assert');
var pug = require('../');
var uglify = require('uglify-js');

pug.filters['custom-filter'] = function (str, options) {
  assert(str === 'foo bar');
  assert(options.foo === 'bar');
  return 'bar baz';
};

// test cases

var cases = fs.readdirSync('test/cases').filter(function(file){
  return ~file.indexOf('.pug');
}).map(function(file){
  return file.replace('.pug', '');
});
try {
  fs.mkdirSync(__dirname + '/output');
} catch (ex) {
  if (ex.code !== 'EEXIST') {
    throw ex;
  }
}

cases.forEach(function(test){
  var name = test.replace(/[-.]/g, ' ');
  it(name, function(){
    var path = 'test/cases/' + test + '.pug';
    var str = fs.readFileSync(path, 'utf8');
    var fn = pug.compile(str, { filename: path, pretty: true, basedir: 'test/cases' });
    var actual = fn({ title: 'Pug' });

    fs.writeFileSync(__dirname + '/output/' + test + '.html', actual);

    var html = fs.readFileSync('test/cases/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
    var clientCode = uglify.minify(pug.compileClient(str, {
      filename: path,
      pretty: true,
      compileDebug: false,
      basedir: 'test/cases'
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code;
    var clientCodeDebug = uglify.minify(pug.compileClient(str, {
      filename: path,
      pretty: true,
      compileDebug: true,
      basedir: 'test/cases'
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code;
    fs.writeFileSync(__dirname + '/output/' + test + '.js', uglify.minify(pug.compileClient(str, {
      filename: path,
      pretty: false,
      compileDebug: false,
      basedir: 'test/cases'
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
});

// test cases

var anti = fs.readdirSync('test/anti-cases').filter(function(file){
  return ~file.indexOf('.pug');
}).map(function(file){
  return file.replace('.pug', '');
});

describe('certain syntax is not allowed and will throw a compile time error', function () {
  anti.forEach(function(test){
    var name = test.replace(/[-.]/g, ' ');
    it(name, function(){
      var path = 'test/anti-cases/' + test + '.pug';
      var str = fs.readFileSync(path, 'utf8');
      try {
        var fn = pug.compile(str, { filename: path, pretty: true, basedir: 'test/anti-cases' });
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
