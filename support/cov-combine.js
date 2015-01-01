#!/usr/bin/env node
/*
 * Combines multiple istanbul coverage JSON result files to create one
 * coverage HTML that covers all the individual results.
 *
 * E.g.
 * $ cov-combine.js cov-pt[0-9]/coverage.json
 * $ www-browser coverage/index.html
 */

/*
 * Written by @TimothyGu. Adapted from
 * https://github.com/gotwarlost/istanbul/blob/master/README.md#generate-reports-given-a-bunch-of-coverage-json-objects
 */

var istanbul  = require('istanbul')
  , collector = new istanbul.Collector()
  , reporter  = new istanbul.Reporter();

for (var i = 2; i < process.argv.length; i++) {
  collector.add(require(
    process.argv[i].replace(/^([^\/])/, process.cwd() + '/$1')));
  console.log('adding ' + process.argv[i]);
}

reporter.addAll([ 'lcov', 'text' ]);
reporter.write(collector, false, function () {
  console.log('All reports generated');
});
