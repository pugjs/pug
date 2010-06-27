
test:
	@./support/expresso/bin/expresso -I lib test/*.js

test-cov:
	@./support/expresso/bin/expresso -I lib --cov test/*.js

benchmarks:
	@./benchmarks/run.js

.PHONY: test test-cov example benchmarks