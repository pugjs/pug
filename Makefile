
TESTS = test/*.js

test:
	@./support/expresso/bin/expresso \
		-I lib \
		-I support/coffee-script/lib \
		-I support/markdown/lib \
		-I support/sass/lib \
		$(TESTS)

api.html: lib/jade.js
	@dox \
		--private \
		--title "Jade" \
		--desc "Jade is a high performance template engine for [node](http://nodejs.org), inspired by [haml](http://haml-lang.com/), created by [TJ Holowaychuk](http://github.com/visionmedia)." \
		 $< > $@

benchmark:
	@node benchmarks/jade.js && \
	 node benchmarks/haml.js && \
	 node benchmarks/haml2.js && \
	 node benchmarks/ejs.js

.PHONY: test example benchmark
