var jade = require('jade');

function compileTemplate(module, filename) {
  var template = jade.compileFileClient(filename);
  var body = "var jade = require('jade/runtime');\n\n" +
             "module.exports = " + template + ";";
  module._compile(body, filename);
}

if (require.extensions) {
  require.extensions['.jade'] = compileTemplate
};
