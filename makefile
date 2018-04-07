DOCTOOL = node_modules/typedoc/bin/typedoc
DOCARGS = --out docs/ src/

TSC = node_modules/.bin/tsc
TSC_ARGS = --pretty

CLEAN = docs/* src/*.js test/*.js 

INPUT = $(wildcard src/*.ts) 
TESTS = $(wildcard test/*.ts) 

INPUT_JS = $(patsubst %.ts,%.js,$(wildcard src/*.ts))
TESTS_JS = $(patsubst %.ts,%.js,$(wildcard test/*.ts))

lib/catnapify.js: $(INPUT_JS)
	cp src/*.js lib/

$(INPUT_JS): $(INPUT) 
	$(TSC) $< $(TSC_ARGS)

$(TESTS_JS): $(TESTS) 
	$(TSC) $< $(TSC_ARGS) 

docs/index.html: $(INPUT) 
	$(DOCTOOL) $(DOCARGS) 

.PHONY: test doc clean watch

doc: docs/index.html

clean:
	rm  $(CLEAN) -fr

test: $(INPUT_JS) $(TESTS_JS) 
	mocha test

watch-test: 
	nodemon --watch src/*.ts --watch test/*.ts --exec "make test" 
