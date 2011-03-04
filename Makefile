
TESTS = test/*.js

test:
	@./support/expresso/bin/expresso \
		-I lib \
		-I support/coffee-script/lib \
		-I support/markdown/lib \
		-I support/sass/lib \
		$(TESTS)

benchmark:
	@node benchmarks/jade.js && \
	 node benchmarks/haml.js && \
	 node benchmarks/haml2.js && \
	 node benchmarks/ejs.js

.PHONY: test benchmark
