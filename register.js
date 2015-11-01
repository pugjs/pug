var jade = require('./');
var resolvedJade = require.resolve('./');

function compileTemplate(module, filename) {
  var template = jade.compileFileClient(filename, {inlineRuntimeFunctions: false});
  var body = "var jade = require('" + resolvedJade + "').runtime;\n\n" +
             "module.exports = " + template + ";";
  module._compile(body, filename);
}

if (require.extensions) {
  require.extensions['.jade'] = compileTemplate
};
