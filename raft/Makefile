
PHANTOM = ../node_modules/.bin/mocha-phantomjs
LINT = ../node_modules/.bin/jslint

test:
	$(PHANTOM) test/index.html

lint:
	$(LINT) scripts/*.js scripts/**/*.js

.PHONY: test lint
