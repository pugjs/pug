
TESTS = test/*.js
SRC = $(shell find lib -name "*.js" -type f)
UGLIFY_FLAGS = --no-mangle 

test:
	@./support/expresso/bin/expresso \
		-I lib \
		-I support/coffee-script/lib \
		-I support/markdown/lib \
		-I support/sass/lib \
		-I support \
		$(TESTS)

benchmark:
	@node benchmarks/jade.js \
	 && node benchmarks/jade-self.js \
	 && node benchmarks/haml.js \
	 && node benchmarks/haml2.js \
	 && node benchmarks/ejs.js

jade.js: $(SRC)
	@node support/compile.js $^

jade.min.js: jade.js
	@uglifyjs $(UGLIFY_FLAGS) $< > $@ \
		&& du jade.min.js \
		&& du jade.js

clean:
	rm -f jade.js
	rm -f jade.min.js

.PHONY: test benchmark clean
