CommonJS style module loading - look to node for the most used implementation

No build step for development - this is cited as a major benefit of RequireJS

Ability for local requires along with node_modules

Leverage our existing component Javascript wrap - provides nice scoping and nested dependencies support for the module pattern

For development, will likely require a $(document).ready() style callback to ensure that scripts are loaded.
- this should only be for inline scripts, any script that is an external resource should not need a `require.ready` so that it can stay consistent.

Any dependencies should be within the actual function invoked for `require.ready` - we need to be able to parse the function body. This is a hassle, but inline scripts shouldn't be a priority and should only be used for quick and dirty stuff, not real apps.

Borrow the `data-main` attribute from RequireJS to tell the bundler the entry-point?


Parse dependencies instead of relying on explicit statements of them up front. It will make it more compatible with existing implementations, and the only speed consideration is in development, where it shouldn't be the primary concern.



TO DO:
[x] Make Script wrapping stand-alone with defined source and dependencies
[x] Make script wrapping capable on the browser (needs to be tested in more browsers)
[x] Decide how to deal with dependencies (parsing or declaring)
[x] append scripts to the document at run-time
[x] create build process for deployment
[x] parse dependencies
[ ] add source mapping
[ ] circular dependencies