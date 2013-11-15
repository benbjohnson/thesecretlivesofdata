
UGLIFY = node_modules/uglify-js/bin/uglifyjs
PHANTOM = node_modules/.bin/mocha-phantomjs
LINT = node_modules/.bin/jslint

test: lint
	$(PHANTOM) test/index.html

lint:
	$(LINT) raft/js/{,**/}*.js

clean:

.PHONY: clean test
