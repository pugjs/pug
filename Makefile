
test:
	@./support/expresso/bin/expresso -I lib test/*.js

test-cov:
	@./support/expresso/bin/expresso -I lib --cov test/*.js

api.html: lib/jade.js
	@dox --title "Jade" \
		 --desc "Jade is a high performance template engine for [node](http://nodejs.org), inspired by [haml](http://haml-lang.com/), created by [TJ Holowaychuk](http://github.com/visionmedia)." \
		 $< > $@

.PHONY: test test-cov example