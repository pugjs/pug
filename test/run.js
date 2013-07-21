
/**
 * Module dependencies.
 */

var jade = require('../')
  , fs = require('fs')
  , uglify = require('uglify-js');

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

cases.forEach(function(test){
  var name = test.replace(/[-.]/g, ' ');
  it(name, function(){
    var path = 'test/cases/' + test + '.jade';
    var str = fs.readFileSync(path, 'utf8');
    var html = fs.readFileSync('test/cases/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
    var fn = jade.compile(str, { filename: path, pretty: true, basedir: 'test/cases' });
    var actual = fn({ title: 'Jade' });

    fs.writeFileSync(__dirname + '/output/' + test + '.html', actual)
    fs.writeFileSync(__dirname + '/output/' + test + '.js', uglify.minify(jade.compile(str, {
      filename: path,
      pretty: false,
      compileDebug: false,
      client: true,
      basedir: 'test/cases'
    }).toString(), {output: {beautify: true}, mangle: false, compress: false, fromString: true}).code)

    if (/filter/.test(name)) {
      actual = actual.replace(/\n/g, '');
      html = html.replace(/\n/g, '');
    }
    JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
  })
});


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
        return;
      }
      throw new Error(test + ' should have thrown an error');
    })
  });
});