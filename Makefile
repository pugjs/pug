
TESTS = test/*.js
SRC = $(shell find lib -name "*.js" -type f)
UGLIFY = $(shell find node_modules -name "uglifyjs" -type f)
UGLIFY_FLAGS = --no-mangle 

all: jade.min.js runtime.min.js

test:
	@./node_modules/.bin/expresso \
		-I node_modules \
		$(TESTS)

benchmark:
	@node support/benchmark

jade.js: $(SRC)
	@node support/compile.js $^

jade.min.js: jade.js
	@$(UGLIFY) $(UGLIFY_FLAGS) $< > $@ \
		&& du jade.min.js \
		&& du jade.js

runtime.js: lib/runtime.js
	@cat support/head.js $< support/foot.js > $@

runtime.min.js: runtime.js
	@$(UGLIFY) $(UGLIFY_FLAGS) $< > $@ \
	  && du runtime.min.js \
	  && du runtime.js

clean:
	rm -f jade.js
	rm -f jade.min.js
	rm -f runtime.js
	rm -f runtime.min.js

.PHONY: test benchmark clean
