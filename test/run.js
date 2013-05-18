
/**
 * Module dependencies.
 */

var jade = require('../')
  , fs = require('fs');

// test cases

var cases = fs.readdirSync('test/cases').filter(function(file){
  return ~file.indexOf('.jade');
}).map(function(file){
  return file.replace('.jade', '');
});

cases.forEach(function(test){
  var name = test.replace(/[-.]/g, ' ');
  it(name, function(){
    var path = 'test/cases/' + test + '.jade';
    var str = fs.readFileSync(path, 'utf8');
    var html = fs.readFileSync('test/cases/' + test + '.html', 'utf8').trim().replace(/\r/g, '');
    var fn = jade.compile(str, { filename: path, pretty: true, basedir: 'test/cases' });
    var actual = fn({ title: 'Jade' });
    if (/filter/.test(name)) {
      actual = actual.replace(/\n/g, '');
      html = html.replace(/\n/g, '');
    }
    JSON.stringify(actual.trim()).should.equal(JSON.stringify(html));
  })
});