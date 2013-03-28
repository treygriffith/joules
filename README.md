Node.js-style module loading on the browser, optimized for developer happiness.

Why Modules?
------------
If you've ever developed anything significant in front-end Javascript, you know that dependency handling is a pain. Add in to that the inherent problems with Javascript's global namespacing defaults and any complex project will quickly get bogged down.

Modules are a way to separate Javascript code into logical chunks that can be depended upon by other modules. If you've ever programmed in another paradigm (including SSJS), modules are a clearly lacking feature of client-side Javascript.


Why not use RequireJS (or another AMD module loader) ?
------------------------------------

The CommonJS Module loading standard (or rather, Node's "interpretation" of the standard) is a more comfortable way to include dependencies, and has tons of traction on the server side. From a module perspective, it is by far the largest ecosystem out there, so it only makes sense to make whatever we use in the browser compatible with that.

AMD works well for what it's for, which is asynchronous module-loading on the web. However the javascript ecosystem is much larger than that, and I think that by limiting use to the browser only, it's limiting its usefulness to developers.

In addition to the clunky syntax it forces on you, it also forces you to have a certain project hierarchy for scripts. While practical, I think a module loader should be unopinionated in terms of project structure.


Why not use Browserify?
-----------------------

Browserify is a great project and one of the big inspirations for this project. However, one of the things that I think RequireJS got right was the development environment - devs want to be able to rapidly change code and see results. Browserify requires a build step, and while a build step is important for a production environment to maximize end-user speed and minimize server load, for development a build step is detrimental.


Why this implemenation?
-----------------------

My hope is that by taking advantage of the primary strengths of the two leading Javascript browser module loaders, RequireJS and Browserify, I can produce an experience that is ultimately better for developers.

It takes the strength of the CommonJS/Node.js module system and community (like Browserify), and puts it into an browser environment that is suitable for rapid development as well as robust deployment (like RequireJS).

When CommonJS was first discussed, the browser was supposed to have stop-gap measures until module loading was natively supported. Those stop-gap measures were:
1) Either use a server to translate CJS modules to something usable in the browser.
2) Or use XMLHttpRequest (XHR) to load the text of modules and do text transforms/parsing in browser.

This implementation does both, using (1) for deployment builds, and (2) for development.

Features
--------

* CommonJS/Node.js style module loading (var module = require('module')) without requiring a build step.

* Supports [`node_modules` modules](http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders) as well as [files as modules](http://nodejs.org/api/modules.html#modules_file_modules) and [directories as modules](http://nodejs.org/api/modules.html#modules_folders_as_modules)

* Inline scripting supported via `require.ready` callback similar to the `$.ready` jQuery callback

* Scripts are fetched asynchronously in development, and are pre-compiled in deployment, but are always guaranteed to be available prior to script execution

* No global namespace pollution (all globals must be explicitly attached to the `window` object)

* Supports a `data-main` attribute as the script's entry point (like RequireJS)

* Compile-time dependency determination - no need to state them up front

* [Circular dependency support](http://nodejs.org/api/modules.html#modules_cycles)

* A Node.js-like execution environment - makes for easy transfer of modules

* Build script is nearly identical to development script, leading to fewer differences between dev and deployment

Issues
------
There are several issues with this implementation that do not come up or are better supported by other browser module loaders.

* file:// usage - due to how many browser vendors implement Cross-domain whitelisting, you cannot xhr a file:// location, even if it's from a file:// location. That means that when using this implementation in development, you have to spin up a server. Since most development work happens this way anyway, this is viewed as an acceptable sacrifice

* Cross-domain/CDN usage - when using this in development, any CDN or other domain you use (e.g. your production domain) has to include the appropriate CORS header to allow your local development environment access. (https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS#Access-Control-Allow-Origin). Since this is one-time setup, it is again viewed as an acceptable sacrifice.

* Debugging - usage in both development and deployment transforms your scripts in such a way that errors will not be thrown in your source file. For simple debugging, it is serviceable, but for more complex web apps a better solution is needed. Some browsers are beginning to implement Source maps, which this will support (eventually) which should help with debugging, but it is not yet widely supported.

* One module per file - part of the CommonJS spec is that only one module is defined per file. This was a deliberate design choice by CommonJS, so it is not by itself an issue. It becomes an issue when talking about a production environment - which is delivered in one file

* Inline scripts are not cross-browser - This implementation supports inline scripts that are housed inside of a `require.ready()` callback. It uses `Function.prototype.toString()` to parse out the require dependencies. This behavior is not 100% cross-browser, but since this is a development characteristic of an inline script, it should not be an issue.

* Variable `require`s - Both the development and deployment environments rely on RegExp parsing to determine dependencies via `require` calls. Therefore any call to `require` with a variable value (or any value that is not a string literal) will at best not return a module, and at worst choke the parser. Generally this is an undesirable design, and can be better replaced with variability within in the `require`d module.

* Multiple I/O calls - In the development environment, the browser makes multiple IO calls in the form of HEAD requests in an attempt to find modules in a way that is consistent with Node.js's search pattern. This can lead to performance slowdowns when there are a large number of modules, and can clutter the debugger with pointless 404's.

* Delayed execution - because the CommonJS style `require` expects a return value instead of a callback, every dependency (and by extension, ever dependency down in the chain) must be available as soon as any code in one sandbox is executed. In practice this means slower start times, as every single dependency, regardless of how soon it will be needed must be loaded. This is mitigated in the deployment version, but is still an issue.
