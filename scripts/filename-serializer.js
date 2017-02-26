const path = require('path');
const basedir = path.resolve(__dirname + '/..');

function matchesBasedir(value) {
  return typeof value === 'string' && value.replace(/\\/g, '/').indexOf(basedir.replace(/\\/g, '/')) === 0
}
function removeBasedir(value) {
  return '<basedir>' + value.substr(basedir.length).replace(/\\/g, '/');
}
// filename serializer that removes the basedir
module.exports = {
  test: function(val) {
    return (
      val && typeof val === 'object' && (matchesBasedir(val.filename) || matchesBasedir(val.message))
    );
  },
  print: function(val, serialize, indent) {
    const output = {};
    for (var key in val) {
      output[key] = val[key];
    }
    if (matchesBasedir(output.filename)) {
      output.filename = removeBasedir(output.filename);
    }
    if (matchesBasedir(output.message)) {
      output.message = removeBasedir(output.message);
    }
    return serialize(output);
  }
};
