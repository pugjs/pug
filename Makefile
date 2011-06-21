
TESTS = test/*.js
SRC = $(shell find lib -name "*.js" -type f)
UGLIFY_FLAGS = --no-mangle 

test:
	@./node_modules/.bin/expresso \
		-I node_modules \
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
