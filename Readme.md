
# Jade - template engine

## bin/jade

Output html to _stdout_:

    jade examples/*.jade --pipe

Generate _examples/*.html_:

    jade examples/*.jade

Pass options:

    jade examples/layout.jade --options '{ locals: { title: "foo" }}'

Usage info:

	Usage: jade [options] <path ...>

	Options:
	  -o, --options STR   JavaScript options object passed
	  -p, --pipe          Output to stdout instead of PATH.html
	  -h, --help          Output help information

