
/**
 * Module dependencies.
 */

var fs = require('fs');
var assert = require('assert');
var jade = require('../');
var uglify = require('uglify-js');
var Promise = require('promise');
var WritableStream = require('stream').Writable;

// test generators
var has_generators = false;
try { 
  var gn = new Function('return function*(){}');
  has_generators = true;
} catch(e) {}

// create output directory
try {
  fs.mkdirSync(__dirname + '/output');
} catch (ex) {
  if (ex.code !== 'EEXIST') {
    throw ex;
  }
}

// test cases
if (!has_generators) {

var cases = fs.readdirSync('test/cases').filter(function(file){
  return ~file.indexOf('.jade');
}).map(function(file){
  return file.replace('.jade', '');
});

var mixinsUnusedTestRan = false;

cases.forEach(function(test){
  var name = test.replace(/[-.]/g, ' ');
  it(name, function(){
    var path = 'test/cases/' + test + '.jade';
    var str = fs.readFileSync(path, 'utf8');
    var html = fs.readFileSync('test/cases/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
    var fn = jade.compile(str, { filename: path, pretty: true, basedir: 'test/cases' });
    var actual = fn({ title: 'Jade' });

    fs.writeFileSync(__dirname + '/output/' + test + '.html', actual)
    var clientCode = uglify.minify(jade.compileClient(str, {
      filename: path,
      pretty: false,
      compileDebug: false,
      client: true,
      basedir: 'test/cases'
    }), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code;
    fs.writeFileSync(__dirname + '/output/' + test + '.js', clientCode);
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
  })
});

after(function () {
  assert(mixinsUnusedTestRan, 'mixins-unused test should run');
})
}

// anti test cases

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


if (has_generators) {

// test cases

var cases = fs.readdirSync('test/cases').filter(function(file){
  return ~file.indexOf('.jade');
}).map(function(file){
  return file.replace('.jade', '');
});

cases.forEach(function(test){
  var name = test.replace(/[-.]/g, ' ');
  it(name, function(done){
    var path = 'test/cases/' + test + '.jade';
    var str = fs.readFileSync(path, 'utf8');
    var html = fs.readFileSync('test/cases/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
    var fn = jade.compileStreaming(str, { filename: path, pretty: true, basedir: 'test/cases' });

    var locals = {
      title: 'Jade'
    };

    var writable = new WritableStream();
    var actual = '';
    writable._write = function(chunk, _, callback) {
      actual += chunk.toString();
      callback();
    }
    writable.once('finish', function() {
      fs.writeFileSync(__dirname + '/output/' + test + '.html', actual)
      if (/filter/.test(test)) {
        actual = actual.replace(/\n| /g, '')
        html = html.replace(/\n| /g, '')
      }
      JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
      done() 
    });
    var readable = fn(locals);
    readable.pipe(writable);


  })
});

// test yield-cases

var generators = fs.readdirSync('test/gn-cases').filter(function(file){
  return ~file.indexOf('.jade');
}).map(function(file){
  return file.replace('.jade', '');
});

generators.forEach(function(test){
  var name = test.replace(/[-.]/g, ' ');
  it(name, function(done){
    var path = 'test/gn-cases/' + test + '.jade';
    var str = fs.readFileSync(path, 'utf8');
    var html = fs.readFileSync('test/gn-cases/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
    var fn = jade.compileStreaming(str, { filename: path, pretty: true, basedir: 'test/gn-cases' });

    var locals = {
      message: 'Jade',
      readdir: Promise.denodeify(fs.readdir),
      stat: Promise.denodeify(fs.stat)
    }

    var writable = new WritableStream();
    var actual = '';
    writable._write = function(chunk, _, callback) {
      actual += chunk.toString();
      callback();
    }
    writable.once('finish', function() {
      fs.writeFileSync(__dirname + '/output/' + test + '.html', actual)
      if (/filter/.test(test)) {
        actual = actual.replace(/\n| /g, '')
        html = html.replace(/\n| /g, '')
      }
      JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
      done() 
    });
    var readable = fn(locals);
    readable.pipe(writable);

  })
});


}
