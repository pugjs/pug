
/**
 * Module dependencies.
 */

var jade = require('jade');

module.exports = {
    'version': function(assert){
        assert.ok(/^\d+\.\d+\.\d+$/.test(jade.version), "Invalid version format");
    }
};