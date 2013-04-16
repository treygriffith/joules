[x] Make Script wrapping stand-alone with defined source and dependencies
[x] Make script wrapping capable on the browser (needs to be tested in more browsers)
[x] Decide how to deal with dependencies (parsing or declaring)
[x] append scripts to the document at run-time
[x] create build process for deployment
[x] parse dependencies
[x] circular dependencies
[x] basic debugging
[x] disregard commented requires
[x] resolve module without fs.Stat#isDirectory support (for browser-side)
[x] add node.js globals (e.g. __dirname)
[ ] cdn support (not sure if this is applicable - are there CommonJS modules on public CDN's?)
[ ] tests (re-using node's tests would be ideal)
[ ] core modules support (substack/browserify has a good start on these)
[ ] Buffer global (browserify)
[ ] process global (is this necessary in the browser?)
[ ] source mapping