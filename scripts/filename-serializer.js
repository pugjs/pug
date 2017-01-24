const path = require('path');
const basedir = path.resolve(__dirname + '/..');

// filename serializer that removes the basedir
module.exports = {
  test: function(val) {
    return (
      val && typeof val === 'object' && ('filename' in val) &&
      val.filename.replace(/\\/g, '/').indexOf(basedir.replace(/\\/g, '/')) === 0
    );
  },
  print: function(val, serialize, indent) {
    const output = {};
    for (var key in val) {
      output[key] = val[key];
    }
    output.filename = '<basedir>' + output.filename.substr(basedir.length).replace(/\\/g, '/');
    return serialize(output);
  }
};
