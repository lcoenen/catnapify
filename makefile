DOCTOOL = node_modules/typedoc/bin/typedoc
DOCARGS = --out docs/ src/
TSC = tsc

lib/catnipify.js: src/**.ts
	$(TSC) --outDir lib $<  --pretty

docs/index.html: src/**.ts
	$(DOCTOOL) $(DOCARGS) 

.PHONY: doc clean

doc: docs/index.html
clean:
	rm docs/* -fr
	rm lib/* -fr
