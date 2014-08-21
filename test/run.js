
/**
 * Module dependencies.
 */

var fs = require('fs');
var assert = require('assert');
var jade = require('../');
var uglify = require('uglify-js');

jade.filters['custom-filter'] = function (str, options) {
  assert(str === 'foo bar');
  assert(options.foo === 'bar');
  return 'bar baz';
};

// test cases

var cases = fs.readdirSync('test/cases').filter(function(file){
  return ~file.indexOf('.jade');
}).map(function(file){
  return file.replace('.jade', '');
});
try {
  fs.mkdirSync(__dirname + '/output');
} catch (ex) {
  if (ex.code !== 'EEXIST') {
    throw ex;
  }
}

var mixinsUnusedTestRan = false;
cases.forEach(function(test){
  var name = test.replace(/[-.]/g, ' ');
  it(name, function(){
    var path = 'test/cases/' + test + '.jade';
    var str = fs.readFileSync(path, 'utf8');
    var html = fs.readFileSync('test/cases/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
    var fn = jade.compile(str, { filename: path, pretty: true, basedir: 'test/cases' });
    var actual = fn({ title: 'Jade' });

    fs.writeFileSync(__dirname + '/output/' + test + '.html', actual);
    var clientCode = uglify.minify(jade.compileClient(str, {
      filename: path,
      pretty: true,
      compileDebug: false,
      basedir: 'test/cases'
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code;
    var clientCodeDebug = uglify.minify(jade.compileClient(str, {
      filename: path,
      pretty: true,
      compileDebug: true,
      basedir: 'test/cases'
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code;
    fs.writeFileSync(__dirname + '/output/' + test + '.js', uglify.minify(jade.compileClient(str, {
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
      mixinsUnusedTestRan = true;
      assert(/never-called/.test(str), 'never-called is in the jade file for mixins-unused');
      assert(!/never-called/.test(clientCode), 'never-called should be removed from the code');
    }
    JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
    actual = Function('jade', clientCode + '\nreturn template;')(jade.runtime)({ title: 'Jade' });
    if (/filter/.test(test)) {
      actual = actual.replace(/\n| /g, '');
    }
    JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
    actual = Function('jade', clientCodeDebug + '\nreturn template;')(jade.runtime)({ title: 'Jade' });
    if (/filter/.test(test)) {
      actual = actual.replace(/\n| /g, '');
    }
    JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
  })
});
after(function () {
  assert(mixinsUnusedTestRan, 'mixins-unused test should run');
})

// test cases

var anti = fs.readdirSync('test/anti-cases').filter(function(file){
  return ~file.indexOf('.jade');
}).map(function(file){
  return file.replace('.jade', '');
});

describe('certain syntax is not allowed and will throw a compile time error', function () {
  anti.forEach(function(test){
    var name = test.replace(/[-.]/g, ' ');
    it(name, function(){
      var path = 'test/anti-cases/' + test + '.jade';
      var str = fs.readFileSync(path, 'utf8');
      try {
        var fn = jade.compile(str, { filename: path, pretty: true, basedir: 'test/anti-cases' });
      } catch (ex) {
        ex.should.be.an.instanceof(Error);
        ex.message.replace(/\\/g, '/').should.startWith(path);
        ex.message.replace(/\\/g, '/').should.match(/:\d+$/m);
        return;
      }
      throw new Error(test + ' should have thrown an error');
    })
  });
});