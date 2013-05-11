/**
 * Loop helper.
 *
 * @param {Number} length
 * @return {Object}
 * @api private
 */

module.exports = function Loop(length) {
  var _index0,
    _index,
    _revIndex,
    _revIndex0,
    _lengthNormalized;

  init();

  function init() {
    _lengthNormalized = length - 1;
    _index0 = 0;
    _index = 1;
    _revIndex0 = _lengthNormalized;
    _revIndex = length;
  }

  function iterate() {
    _index++;
    _index0++;
    _revIndex--;
    _revIndex0--;
  }

  // Expose API

  return {
    length: function() {
      return length;
    },
    index: function() {
      return _index;
    },
    index0: function() {
      return _index0;
    },
    revindex: function() {
      return _revIndex;
    },
    revindex0: function() {
      return _revIndex0;
    },
    first: function() {
      return _index0 == 0;
    },
    last: function() {
      return _index0 == _lengthNormalized;
    },
    iterate: iterate
  }
};
