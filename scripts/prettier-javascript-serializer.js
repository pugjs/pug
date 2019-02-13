const prettier = require('prettier');

const prettierOptions = {
  parser: 'babel'
} // optional

// filename serializer that removes the basedir
module.exports = {
  test: function(val) {
    try {
      return (
        typeof val === 'string' &&
        /function /.test(val) &&
        val !== prettier.format(val, prettierOptions)
      );
    } catch (ex) {
      return false;
    }
  },
  print: function(val, serialize, indent) {
    return serialize(prettier.format(val, prettierOptions));
  }
};
