CommonJS style module loading - look to node for the most used implementation

No build step for development - this is cited as a major benefit of RequireJS

Due to CommonJS style module loading, dependencies need to be determined before code is executed - need to decide if this should be declarative (e.g. through a .json manifest file for every loaded file) or scanned (e.g. parsing each file for `require`s)

Ability for local requires along with node_modules

Leverage our existing component Javascript wrap - provides nice scoping and nested dependencies support for the module pattern

For development, will likely require a $(document).ready() style callback to ensure that scripts are loaded.
- this should only be for inline scripts, any script that is an external resource should not need a `require.ready` so that it can stay consistent.

Any dependencies should be within the actual function invoked for `require.ready` - we need to be able to parse the function body. This is a hassle, but inline scripts shouldn't be a priority and should only be used for quick and dirty stuff, not real apps.

Borrow the `data-main` attribute from RequireJS to tell the bundler the entry-point?

Can you wrap top level scripts? Can't exactly wrap scripts that are on the page itself....need to make `require` available as window.require, after the callback


Parse dependencies instead of relying on explicit statements of them up front. It will make it more compatible with existing implementations, and the only speed consideration is in development, where it shouldn't be the primary concern.



TO DO:
[x] Make Script wrapping stand-alone with defined source and dependencies
[x] Make script wrapping capable on the browser (needs to be tested in more browsers)
[x] Decide how to deal with dependencies (parsing or declaring)
[x] append scripts to the document at run-time
[x] create build process for deployment
[x] parse dependencies
[ ] add source mapping
[ ] make modules more adherent to Node.js standard


RequireJS's statements:

Problems:
* Web sites are turning into Web apps
* Code complexity grows as the site gets bigger
* Assembly gets harder
* Developer wants discrete JS files/modules
* Deployment wants optimized code in just one or a few HTTP calls

Front-end developers need a solution with:
* Some sort of #include/import/require
* ability to load nested dependencies
* ease of use for developer but then backed by an optimization tool that helps deployment

"It is tempting to use XMLHttpRequest (XHR) to load the scripts. If XHR is used, then we can massage the text above -- we can do a regexp to find require() calls, make sure we load those scripts, then use eval() or script elements that have their body text set to the text of the script loaded via XHR."

Using script tags with body text set to file text is bad:
* While debugging, the line number you get for an error does not map to the original source file (note: source mapping is pretty good and getting better. This should not be a serious problem)

"XHR also has issues with cross-domain requests." - we can should be able to solve this at least in the deployment phase, which is where the cross-browser problems really come to light. The CDN could still be an issue though...