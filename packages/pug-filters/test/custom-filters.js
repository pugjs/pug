var assert = require('assert');

module.exports = {
  custom: function (str, options) {
    assert(options.opt === 'val');
    assert(options.num === 2);
    return 'BEGIN' + str + 'END';
  }
};
