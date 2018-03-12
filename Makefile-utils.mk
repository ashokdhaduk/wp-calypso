# Portability
ifdef ComSpec
	RM := del /F /Q
    SLASH :=\\
else
	RM := rm -rf
    SLASH :=/
endif

# Use $/ as the path separator
/ := $(strip $(SLASH))

# File classes
FILES_JS := $(shell \
	find . \
		-not \( -path '.$/.git' -prune \) \
		-not \( -path '.$/build' -prune \) \
		-not \( -path '.$/node_modules' -prune \) \
		-not \( -path '.$/public' -prune \) \
		-type f \
		\( -name '*.js' -or -name '*.jsx' \) \
)

FILES_SCSS := $(shell \
	find client assets \
		-type f \
		-name '*.scss' \
)

# git
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

# node/npm helpers
NODE_ENV ?= development
NPM_BIN  := node_modules$/.bin$/
NODE     := $(shell which node)
NPM      := $(shell which npm)

# $(call npm-deps,package-a package-b package-c)
npm-deps = $(addprefix node_modules$/,$1) missing-modules

.PHONY: missing-modules
missing-modules:
	$(RM) .make-cache$/needed-modules; \
	$(NPM) install $(shell cat .make-cache$/needed-modules)

.SECONDEXPANSION: node_modules
node_modules: DEPS = $(shell $(NODE) -e 'console.log(Object.keys(require(".$/package.json").dependencies).join(" "))')
node_modules: DEVS = $(shell $(NODE) -e 'console.log(Object.keys(require(".$/package.json").devDependencies).join(" "))')
node_modules: npm-shrinkwrap.json package.json $$(call npm-deps,$$(DEPS) $$(DEVS))

# When installing here then we're probably running a
# build command like `eslint` and don't need to be
# _as_ stringent on updating when the `package.json`
# or `npm-shrinkwrap.json` files change
.SECONDARY: node_modules%
node_modules$/%:
	echo "$(notdir $@) " > .make-cache$/needed-modules

# Optimizing phony targets that should
# only run when their dependencies change
BOOT := $(shell mkdir -p .make-cache)
TOUCH_CACHE = touch .make-cache$/
~ = $(strip $(TOUCH_CACHE))$(subst $/,-,$@)

vpath lint% .make-cache
vpath pre-commit .make-cache
vpath versions .make-cache

# Convenience utilities

list-op = $(shell comm $3 <(echo $1 | tr " " "\n") <(echo $2 | tr " " "\n"))
list-diff = $(call list-op,$1,$2,-23)
list-same = $(call list-op,$1,$2,-12)

# $(call when-less-than,min-size,default,list)
when-less-than = $(if $(shell [ $(words $3) -gt $1 ] && echo gt),$3,$2)

# $(call when-more-than,max-size,default,list)
when-more-than = $(if $(shell [ $(words $3) -lt $1 ] && echo lt),$3,$2)

# $(call when-not-empty,list,body)
when-not-empty = $(if $(shell [ $(words $1) -gt 0 ] && echo gt),$2,$3)

# Terminal
FG_BLUE    = \\033[34m
FG_CYAN    = \\033[36m
FG_GREEN   = \\033[32m
FG_RED     = \\033[31m
FG_RESET   = \\033[39m
TERM_RESET = \\033[0m

# Reset make
.POSIX:
.SUFFIXES:
SHELL := bash
UNQUIET ?= --quiet
UNQUIET :=
MAKEFLAGS += --no-builtin-rules $(UNQUIET)
