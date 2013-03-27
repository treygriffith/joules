(function() {window.require = function() {};

window.require.fire = function(evt) {
};

window.require.ready = function(fn) {

	var whole = fn.toString();
	var body = whole.substring(whole.indexOf('{')+1, whole.lastIndexOf('}'));

	loadModule(body, Math.round(Math.random()*10000).toString(), function(err, module) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.text = '(function() { var require = {ready:window.require.ready, fire:window.require.fire};\n' + module.write(null, true) + module.invoke() + '})();';
		window.document.body.appendChild(script);
	}, true);
};var cacheWrap = "'{{id}}' : function(cache, dependencies) {\n" +
"	return function(parent) {\n" +
"		if(!cache['{{id}}']) {\n" +
"			cache['{{id}}'] = (function(module) {\n" +
"				var dependencies = undefined, cache = undefined, parent = undefined;\n" +
"\n" +
"				(function(module, require, exports) {\n" +
"\n" +
"					{{source}}\n" +
"\n" +
"				})(module, function() {\n" +
"					return module.require.apply(module, Array.prototype.slice.call(arguments));\n" +
"				}, module.exports);\n" +
"\n" +
"				module.loaded = true;\n" +
"				return module;\n" +
"			})({\n" +
"				require: function(name, assignment) {\n" +
"					if(typeof dependencies[name] !== 'function') {\n" +
"						throw new Error('Module Not Found');\n" +
"					}\n" +
"					var childModule = dependencies[name](this);\n" +
"					this.children.push(childModule);\n" +
"					return childModule.exports;\n" +
"				},\n" +
"				exports: {},\n" +
"				id:'{{id}}',\n" +
"				loaded:false,\n" +
"				children: [],\n" +
"				parent: parent\n" +
"			});\n" +
"		}\n" +
"		return cache['{{id}}'];\n" +
"	};\n" +
"}";
var dependenciesWrap = "(function(modules) {\n" +
"	var dependencies = {};\n" +
"\n" +
"	{{dependencies}}\n" +
"\n" +
"	modules['{{name}}'] = dependency_cache['{{id}}'](cache, dependencies);\n" +
"\n" +
"})(dependencies);";
var globalWrap = "(function(dependency_cache) {\n" +
"	var cache = {},\n" +
"		dependencies = {};\n" +
"\n" +
"	var _require = require;\n" +
"\n" +
"	require = function(name) {\n" +
"		var module;\n" +
"\n" +
"		if(typeof dependencies[name] !== 'function') {\n" +
"			throw new Error('Module Not Found');\n" +
"		}\n" +
"\n" +
"		module = dependencies[name](this);\n" +
"\n" +
"		module.parent = this;\n" +
"\n" +
"		return module.exports;\n" +
"	};\n" +
"\n" +
"	require._events = _require._events,\n" +
"	require.fire = _require.fire,\n" +
"	require.ready = _require.ready;\n" +
"\n" +
"\n" +
"	{{dependencies}}\n" +
"\n" +
"\n" +
"})({\n" +
"\n" +
"	{{cache}}\n" +
"\n" +
"});\n" +
"";
var rootWrap = "dependencies['{{name}}'] = dependency_cache['{{id}}'](cache, dependencies);";
var invoke = "require('{{name}}');";
var browserBuild = true;
if(typeof browserBuild === 'undefined') {
	var fs = require('fs'),
		cacheWrap = fs.readFileSync('./wrappers/cache-wrap.js', 'utf8'),
		dependenciesWrap = fs.readFileSync('./wrappers/dependencies-wrap.js', 'utf8'),
		globalWrap = fs.readFileSync('./wrappers/global-wrap.js', 'utf8'),
		rootWrap = fs.readFileSync('./wrappers/root-wrap.js', 'utf8'),
		invoke = fs.readFileSync('./wrappers/build-invoke.js', 'utf8');
}


// Need a way to make all dependencies of a top level script available on window.require;
// Top level script therefore does not have a source to be wrapped

function Script(dependencies, id, name, source) {
	this.id = id;
	this.name = name;
	this.source = source;
	this.dependencies = dependencies;
	this.cache = [];

	return this;
}

Script.prototype.write = function(cache, root) {
	var script = this;

	this.dependenciesSource = "";
	this.dependencies.forEach(function(dependency) {
		script.dependenciesSource += dependency.write(cache || script.cache);
	});

	if(root) {
		// writing as root script
		if(this.source) {
			this.addToCache(cache);
			this.dependenciesSource += this.rootWrap();
		}
		return this.globalWrap();
	}

	// writing as a dependency
	this.addToCache(cache);
	return this.wrap();
};

Script.prototype.invoke = function() {
	return invoke
			.replace(/{{name}}/g, this.name);
};

Script.prototype.addToCache = function(cache) {
	var wrapped;
	cache = cache || this.cache;

	wrapped = cacheWrap
				.replace(/{{id}}/g, this.id)
				.replace(/{{source}}/g, this.source);

	if(!!~cache.indexOf(wrapped)) {
		// don't add the same script twice
		return;
	}
	cache.push(wrapped);

	return wrapped;
};

Script.prototype.wrap = function() {
	return dependenciesWrap
			.replace(/{{id}}/g, this.id)
			.replace(/{{name}}/g, this.name)
			.replace(/{{dependencies}}/g, this.dependenciesSource);
};

Script.prototype.rootWrap = function() {
	return rootWrap
			.replace(/{{id}}/g, this.id)
			.replace(/{{name}}/g, this.name);
};

Script.prototype.globalWrap = function() {
	return globalWrap
			.replace(/{{dependencies}}/g, this.dependenciesSource)
			.replace(/{{cache}}/g, this.cache);
};

if(typeof browserBuild === 'undefined') {
	module.exports = Script;
}var manifest_filename = "index.json",
	readFile,
	exists,
	stat,
	resolve;

if(typeof browserBuild === 'undefined') {
	readFile = require('fs').readFile;
	exists = require('fs').exists;
	stat = require('fs').stat;
	resolve = require('path').resolve;
	var Script = require('./script');
} else {
	// Shim for array filter
	if (!Array.prototype.filter) {
		Array.prototype.filter = function(fun /*, thisp */) {
			"use strict";

			if (this === null)
				throw new TypeError();

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun != "function")
				throw new TypeError();

			var res = [];
			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t) {
					var val = t[i]; // in case fun mutates this
					if (fun.call(thisp, val, i, t))
						res.push(val);
				}
			}
			return res;
		};
	}

	// shim for process.cwd()
	var process = {
		cwd: function() {
			var href = window.location.pathname;
			href = href.split('/');
			href.pop();
			return href.join('/') || '/';
		}
	};

	// xhr
	function sendRequest(url, method, callback) {
		var req = createXMLHTTPObject();
		if (!req) return;
		req.open(method,url,true);
		req.onreadystatechange = function () {
			if (req.readyState != 4) return;
			callback(req);
		};
		if (req.readyState == 4) return;
		req.send();
	}

	var XMLHttpFactories = [
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		function () {return new ActiveXObject("Microsoft.XMLHTTP")}
	];

	function createXMLHTTPObject() {
		var xmlhttp = false;
		for (var i=0;i<XMLHttpFactories.length;i++) {
			try {
				xmlhttp = XMLHttpFactories[i]();
			}
			catch (e) {
				continue;
			}
			break;
		}
		return xmlhttp;
	}

	// shim for fs functions
	readFile = function(path, encoding, callback) {
		if(!callback) {
			callback = encoding;
			encoding = 'utf8';
		}
		sendRequest(path, 'GET', function(req) {
			if(req.status !== 200 && req.status !== 304) {
				callback(new Error("File does not exist"));
				return;
			}
			callback(null, req.responseText);
		});
	};
	exists = function(path, callback) {
		sendRequest(path, 'HEAD', function(req) {
			if(req.status === 200 || req.status === 304) {
				callback(true);
				return;
			}
			callback(false);
		});
	};
	stat = function(path, callback) {
		exists(path, function(exist) {
			if(!exist) {
				callback(new Error("File does not exist"));
			}
			callback(null, {
				isFile: function() {
					return true;
				},
				isDirectory: function() {
					return false;
				},
				isBlockDevice: function() {
					return false;
				},
				isCharacterDevice: function() {
					return false;
				},
				isSymbolicLink: function() {
					return false;
				},
				isFIFO: function() {
					return false;
				},
				isSocket: function() {
					return false;
				}
			});
		});
	};

	//shim for path.resolve
	resolve = function(from, to) {
		var resolvedPath = '',
			resolvedAbsolute = false;

		for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
			var path = (i >= 0) ? arguments[i] : process.cwd();

			// Skip empty and invalid entries
			if (typeof path !== 'string') {
				throw new TypeError('Arguments to path.resolve must be strings');
			} else if (!path) {
				continue;
			}

			resolvedPath = path + '/' + resolvedPath;
			resolvedAbsolute = path.charAt(0) === '/';
		}

		// At this point the path should be resolved to a full absolute path, but
		// handle relative paths to be safe (might happen when process.cwd() fails)

		// Normalize the path
		resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
			return !!p;
		}), !resolvedAbsolute).join('/');

		return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '';
	};

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	// if the path tries to go above the root, `up` ends up > 0
	var up = 0;
	for (var i = parts.length - 1; i >= 0; i--) {
		var last = parts[i];
		if (last === '.') {
			parts.splice(i, 1);
		} else if (last === '..') {
			parts.splice(i, 1);
			up++;
		} else if (up) {
			parts.splice(i, 1);
			up--;
		}
	}

	// if the path is allowed to go above the root, restore leading ..s
	if (allowAboveRoot) {
		for (; up--; up) {
			parts.unshift('..');
		}
	}

	return parts;
	}

}

function loadFile(name, location, callback, html) {

	return function(err, contents) {
		if(err) {
			callback(err);
			return;
		}

		var dependencies = findDependencies(contents, html),
			loadedDependencies = [],
			done = function() {
				callback(null, new Script(loadedDependencies, resolve(location), name, !!html ? null : contents));
			};

		if(!dependencies.length) {
			done();
			return;
		}

		dependencies.forEach(function(dep_location) {

			loadModule(resolve(location, dep_location), dep_location, function(err, dependency) {
				loadedDependencies.push(dependency);

				if(dependencies.length === loadedDependencies.length) {
					// done loading dependencies
					done();
				}
			});
		});

	};	
}

function loadJs(name, location, callback) {
	return loadFile(name, location, callback, false);
}

function loadHtml(name, location, callback) {
	return loadFile(name, location, callback, true);
}

function loadDir(name, location, callback) {

	// look for a package.json
	exists(resolve(location, 'package.json'), function(file_exists) {
		if(file_exists) {
			// parse json to find main
			
			readFile(resolve(location, 'package.json'), 'utf8', function(err, raw) {
				if(err) {
					callback(err);
					return;
				}

				var manifest = {};

				try {
					manifest = JSON.parse(raw);
				} catch(e) {
					callback(e);
					return;
				}

				if(!manifest.main) {
					callback(new Error("Package.json must have 'main' defined"));
					return;
				}

				// load the main file
				readFile(resolve(location, manifest.main), 'utf8', loadJs(name, location, callback));
			});

			return;
		}

		// look for an index.js file
		exists(resolve(location, 'index.js'), function(file_exists) {
			if(file_exists) {
				// index.js is our entry point
				readFile(resolve(location, 'index.js'), 'utf8', loadJs(name, location, callback));
				return;
			}

			// look for an index.html file
			exists(resolve(location, 'index.html'), function(file_exists) {
				if(file_exists) {
					readFile(resolve(location, 'index.html'), 'utf8', loadHtml(name, location, callback));
					return;
				}

				// No module found - throw this error at build time, not runtime
				throw new Error("Module Not Found: "+location);
			});
		});
	});	
}


function findDependencies(string, html) {
	var matches = [],
		scripts = [],
		match,
		scriptRE = /<script(.|\s)*?>([\s\S]*?)<\/script>/g,
		requireRE = /require\(('|")(.*?)('|")\)/g;

	// if the html flag is set, only look in <script> tags
	if(html) {
		// retrieve all the script bodies
		while((match = scriptRE.exec(string)) !== null) {
			scripts.push(match[2]);
		}
		// concatenate them so we can search for requires
		string = scripts.join("\n");
	}

	// this doesn't actually make sure that the quotes are the same on both sides, just that it is quoted somehow
	while((match = requireRE.exec(string)) !== null) {
		matches.push(match[2]);
	}

	return matches;
}

// raw flag signifies that location is actually the raw contents of the entrypoint file
function loadModule(location, name, callback, raw) {

	if(raw) {
		loadJs(name, './', callback)(null, location);
		return;
	}

	location = resolve(location);

	if(location[0] === '.' || location[0] === '/') {
		// this is a file
		exists(location, function(file_exists) {
			if(file_exists) {

				// determine if this is a directory
				stat(location, function(err, stats) {
					if(err) {
						callback(err);
						return;
					}

					if(stats.isDirectory()) {
						// this is a directory, so we treat it like one
						loadDir(name, location, callback);
						return;
					}

					if(!stats.isFile()) {
						throw new Error("Module is not a file or a directory");
					}

					// exact filename exists, parse as javascript
					readFile(location, 'utf8', loadJs(name, location, callback));
				});
				
				return;
			}

			exists(location + '.js', function(file_exists) {
				if(file_exists) {
					// .js appended, parse as javascript
					readFile(location + '.js', 'utf8', loadJs(name, location, callback));
					return;
				}

				exists(location + '.json', function(file_exists) {
					if(file_exists) {
						// .json appended, parse as json
						readFile(location + '.json', 'utf8', function(err, contents) {
							if(err) {
								callback(err);
								return;
							}
							// export the parsed JSON in the browser
							callback(null, new Script([], location, name, "module.exports = JSON.parse('" + contents.replace(/'/g, "\'").replace(/\n/g, " ") + "');"));
						});
						
						return;
					}

					// check if it is html
					exists(location + '.html', function(file_exists) {
						if(file_exists) {
							readFile(location + '.html', loadHtml(name, location, callback));

							return;
						}
					});

					// treat this as a directory
					loadDir(name, location, callback);

				});
			});
		});
	} else {
		// this is a core module or node_module
		throw new Error("core modules not implemented");
	}
}

if(typeof browserBuild === 'undefined') {
	module.exports = loadModule;
}})();