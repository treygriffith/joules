Joules
=========
Node.js-style module loading on the browser optimized for rapid development and robust deployment.

Installation
------------

Using NPM, pass the `-g` flag to make the `joules` command available on the command line

```bash
	$ npm install joules -g
```

Install it in your project's repository to make deployment builds and hinting available on the command line

```bash
	$ npm install joules
```

or clone the repository with Git

```bash
	$ git clone git://github.com/treygriffith/joules.git node_modules/express-render/
```


Usage
-----

### Development

#### Building the Development Script

Joules comes with a development script, `joules.js`, in the root directory, but it can be re-built at any time with the `joules-dev` command:

```bash
	$ joules-dev public/js
	/Users/username/project/public/js/joules.js written
```
#### Using in your project

When using in development, you just need to add the development script to every page that you want to have module loading support, before any scripts that use modules.

```html
	<html>
		<head>
			<title>My Cool Webpage</title>
		</head>
		<body>
			<p>This is my cool webpage. Welcome!</p>
			<script src="/js/joules.js"></script>
			<script>
				require.ready(function() {
					var $ = require('./js/jquery');
					$("p").text("Go Away!");
				});
			</script>
		</body>
	</html>
```

You'll notice that when using a script inline on the page, it has to be wrapped in a function that is a callback for `require.ready`, which functions similarly to `$(document).ready` for jQuery, but waits for dependencies to load as opposed to waiting for `domReady`.

#### Inline Dependency Declaration Limitations

You should note that every dependency must be declared within the function body of the callback for `require.ready`. For example, this won't work:

```html
	...
	<script>
		// DON'T DO THIS
		var ready = function() {
			var $ = require('jquery');
		}
		require.ready(function() {
			// no dependencies are declared within the callback function body
			ready();
		});
	</script>
	...
```
#### Main Entrypoint

You can also define a `main` script, which is the primary entry-point for the javascript on the page. Scripts defined externally do not need the `require.ready` callback - they won't be invoked until all dependencies are loaded. For larger web apps, this is usually desirable when compared to inline scripts. This is similar to RequireJS's behavior:

`index.html`:

```html
	...
	<script src="/js/joules.js" data-main="/js/main.js"></script>
	....
```

`main.js`:

```javascript
	var $ = require('jquery');
	var content = require('./content');

	$("p").text(content);
```

#### Multiple Scripts

Joules supports multiple `data-main` scripts (in different script tags) as well as multiple inline script. Each inline script and `data-main` script will have dependencies loaded independently.

#### Module Lookup

Joules loads modules using the [same lookup pattern as Node](http://nodejs.org/api/modules.html#modules_modules). In addition, it also looks for HTML files (as index files, and also as exact filenames) that it can scan for inline javascript. The HTML behavior is recommended only when targeting as the base module, not as a way to reference dependencies.

#### Hinting

Due to the sometimes lengthy lookup process for modules, using HTTP requests can be burdensome, even in a development environment. To help alleviate the problem, Joules provides a way to generate a hinting file for your public directory to reduce HTTP requests.

If you're using Node.js, the hinting file is generated as follows:

```javascript
	// public is the directory from which our static assets are served
	joules.hint('./public', function(err) {
		if(err) throw err;
		console.log("hinting file created.");
	});
```

This command automatically watches the `./public` directory for any changes, and will update the hinting file appropriately, allowing you to keep the same rapid development environment without tons of HTTP requests.

### Deployment
To serve your modules as a compiled bundle that is optimized for deployment, you can use the command line builder, or the programmatic version of the same tool for use in a larger build process.

To build a script, you simply have to define a target. The target can be an HTML file, which will be scanned for inline javascript, or the main entrypoint to your program, like `main.js` in the development section.

#### Command Line Build

```bash
	$ joules ./js/main.js
	main.joules.js written.
```

By default, Joules outputs a file called `target.joules.js` where `target` is the target module or filename, in the same directory as the target module or file. This can be modified by passing the `out` flag.

```bash
	$ joules ./js/main.js --out ./js/bundle.js
	bundle.js written.
```

#### Programmatic Build

For using Joules as part of a larger build process, require the Joules module:

```javascript
	var joules = require('joules');
	joules.build('./js/main.js', function(err, script) {
		fs.writeFileSync('./js/my-bundle.js', script, 'utf8');
	});
```

#### Using in your project

Once you've built your bundled file, you can include it like any regular script on the page. To borrow examples from the deployment section:

* Targeting an external script, `main.js`:

```html
	<html>
		<head>
			<title>My Cool Webpage</title>
		</head>
		<body>
			<p>This is my cool webpage. Welcome!</p>
			<script src="/js/main.joules.js"></script>
		</body>
	</html>
```

* Targeting the inline script for this page, `index.html`

```html
	<html>
		<head>
			<title>My Cool Webpage</title>
		</head>
		<body>
			<p>This is my cool webpage. Welcome!</p>
			<script src="/js/index.joules.js"></script>
		</body>
	</html>
```


Why Modules?
------------
If you've ever developed anything significant in front-end Javascript, you know that dependency handling is a pain. Add in to that the inherent problems with Javascript's global namespacing defaults and any complex project will quickly get bogged down.

Modules are a way to separate Javascript code into logical chunks that can be depended upon by other modules. If you've ever programmed in another paradigm (including SSJS), modules are a clearly lacking feature of client-side Javascript.


Why not use RequireJS?
---------------------
(or another AMD module loader)

The CommonJS Module loading standard (or rather, Node's "interpretation" of the standard) is a more comfortable way to include dependencies, and has tons of traction on the server side. From a module perspective, it is by far the largest ecosystem out there, so it makes sense to maximize browser modules with Node-style modules.

AMD works well for what it's for, which is asynchronous module-loading on the web. However the javascript ecosystem is much larger than that, and I think that by limiting use to the browser only, it's limiting its usefulness to developers.

AMD requires that module developers include a bunch of boilerplate in their projects, which doesn't make sense for maximum compatibility.

In addition to the clunky syntax it forces on you, RequireJS in particular also forces you to have a certain project hierarchy for scripts. While practical in terms of reducing I/O, I think a module loader should be unopinionated in terms of project structure.


Why not use Browserify?
-----------------------

Browserify is a great project and one of the big inspirations for this project. However, one of the things that I think RequireJS got right was the development environment - devs want to be able to rapidly change code and see results. Browserify requires a build step, and while a build step is important for a production environment to maximize end-user speed and minimize server load, for development a build step is detrimental to developer speed.

That said, the work that Browserify has done on translating Node's core modules for the web is excellent, and I hope to incorporate those into this project as well as extend them where possible.


Why Joules?
-----------------------

My hope is that by taking advantage of the primary strengths of the two leading Javascript browser module loaders, RequireJS and Browserify, I can produce an experience that is ultimately better for developers.

It takes the strength of the CommonJS/Node.js module system and community (like Browserify), and puts it into an browser environment that is suitable for rapid development as well as robust deployment (like RequireJS).

When CommonJS was first discussed, the browser was supposed to have stop-gap measures until module loading was natively supported. Those stop-gap measures were:
1) Either use a server to translate CJS modules to something usable in the browser.
2) Or use XMLHttpRequest (XHR) to load the text of modules and do text transforms/parsing in browser.

This implementation does both, using (1) for deployment builds, and (2) for development.

Features
--------

* CommonJS/Node.js style module loading (`var module = require('module')`) without requiring a build step.

* A Node.js-like execution environment - makes for easy transfer of modules

* Supports [`node_modules` modules](http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders) as well as [files as modules](http://nodejs.org/api/modules.html#modules_file_modules) and [directories as modules](http://nodejs.org/api/modules.html#modules_folders_as_modules)

* Ability to use NPM and other Node.js package management tools to manage packages for the front-end, with occasional minor adjustments for browser vs. server behavior

* Inline scripting supported via `require.ready` callback similar to the `$.ready` jQuery callback

* Scripts are fetched asynchronously in development, and are pre-compiled in deployment, but are always guaranteed to be available prior to script execution

* No global namespace pollution (all globals must be explicitly attached to the `window` object, or the semi-global `global` object)

* Supports a `data-main` attribute as the script's entry point (like RequireJS)

* Compile-time dependency determination - no need to state them up front

* [Circular dependency support](http://nodejs.org/api/modules.html#modules_cycles)

* Build script is nearly identical to development script, leading to fewer differences between dev and deployment

Issues
------
There are several issues with Joules that do not come up or are better supported by other browser module loaders.

* file:// usage - due to how many browser vendors implement Cross-domain whitelisting, you cannot xhr a file:// location, even if it's from a file:// location. That means that when using Joules in development, you have to spin up a server. Since most development work happens this way anyway, this is viewed as an acceptable sacrifice, but it is a limitation.

* Cross-domain/CDN usage - when using Joules in development, any CDN or other domain you use (e.g. your production domain) has to include the appropriate [CORS header](https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS#Access-Control-Allow-Origin) to allow your local development environment access. This is one-time setup, but might be a difference maker depending on your CDN.

* Debugging - using Joules in both development and deployment transforms your scripts in such a way that errors will not be thrown in your source file. For simple debugging it is serviceable, but for more complex web apps a better solution is needed. Some browsers are beginning to implement Source maps, which Joules will support (eventually) which should help with debugging, but it is not yet widely supported.

* Inline scripts are not cross-browser - Joules supports inline scripts that are housed inside of a `require.ready()` callback. It uses `Function.prototype.toString()` to parse out the `require` dependencies. This behavior is not 100% cross-browser, but is only used in development (for deployment you can specifically target HTML files that contain inline scripts).

* Variable `require`s - Both the development and deployment environments rely on RegExp parsing to determine dependencies via `require` calls. Therefore any call to `require` with a variable value (or any value that is not a string literal) will at best not return a module, and at worst choke the parser. Generally this is an undesirable design in any case, and can be better replaced with variability within in the `require`d module.

* Multiple I/O calls - In the development environment, the browser makes multiple I/O calls in the form of HEAD requests in an attempt to find modules in a way that is consistent with Node.js's search pattern. While this is usually acceptable in a server environment, on the browser this can lead to performance slowdowns when there are a large number of modules, and can clutter the debugger with pointless 404's. To mitigate this, you can enable [server-side hinting](#hinting) to provide the front-end with information about the directory structure, which significantly speeds up development loading and gets rid of 404 errors, but doesn't completely get rid of I/O.

* Delayed execution - because the CommonJS style `require` expects an immediate return value instead of a callback, every dependency (and by extension, each dependency's depdendency on down the chain) must be available as soon as any code in one sandbox is executed. In practice this means slower start times, as every single dependency, regardless of how soon it will be needed, must be loaded. This is mitigated in the deployment version where all the scripts are bundled, but is still an issue.

* Circular Dependencies in node_modules - The current way that circular dependencies are detected in the source code is flawed when working with using modules required by name. This issue is being actively worked.

License
-------

MIT - [View Full License](LICENSE)
