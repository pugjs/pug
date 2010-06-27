
test:
	@./support/expresso/bin/expresso -I lib test/*.js

test-cov:
	@./support/expresso/bin/expresso -I lib --cov test/*.js

benchmark:
	@./benchmark/run.js

.PHONY: test test-cov example benchmark