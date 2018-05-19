DOCTOOL = node_modules/typedoc/bin/typedoc DOCARGS = --out docs/ src/

MOCHA_BIN = node_modules/mocha/bin/mocha

TSC = node_modules/.bin/tsc
TSC_ARGS = --pretty -d --declarationDir lib/ --moduleResolution Node --module CommonJS --target ES5 --experimentalDecorators --lib es5,es6,dom

CLEAN = docs/* src/*.js test/*.js #

INPUT = $(wildcard src/*.ts) 
TESTS = $(wildcard test/*.ts) 

INPUT_JS = $(patsubst %.ts,%.js,$(wildcard src/*.ts))
TESTS_JS = $(patsubst %.ts,%.js,$(wildcard test/*.ts))

lib/catnapify.js: $(INPUT_JS)
	cp src/*.js lib/

$(INPUT_JS): $(INPUT) 
	$(TSC) $^ $(TSC_ARGS)

$(TESTS_JS): $(TESTS) 
	$(TSC) $^ $(TSC_ARGS) 

docs/index.html: $(INPUT) 
	$(DOCTOOL) $(DOCARGS) 

.PHONY: test doc clean watch

doc: docs/index.html

clean:
	rm  $(CLEAN) -fr

test: $(INPUT_JS) $(TESTS_JS) 
	$(MOCHA_BIN) test

watch-test: 
	nodemon --watch src --watch test --exec "make test || true" -e ts 
