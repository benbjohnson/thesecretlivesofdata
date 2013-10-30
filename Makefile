
COMPONENT = node_modules/component/bin/component
UGLIFY = node_modules/uglify-js/bin/uglifyjs
PHANTOM = node_modules/.bin/mocha-phantomjs
LINT = node_modules/.bin/jslint

build: components lib/*.js
	@component build --dev

components: component.json
	@component install --dev

tsld.js: components
	$(COMPONENT) build --standalone tsld --out . --name tsld
	$(UGLIFY) tsld.js --output tsld.min.js

test: lint build
	$(PHANTOM) test/index.html

lint:
	$(LINT) lib/*.js

clean:
	rm -fr build components template.js

.PHONY: clean test
