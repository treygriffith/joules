(function() {var cacheWrap = "'{{id}}' : function(cache, dependencies) {\n" +
"	return function(parent) {\n" +
"\n" +
"		var id = '{{id}}';\n" +
"\n" +
"		// Set up Module specific 'globals'\n" +
"		var __filename = id, __dirname = __filename.split('/');\n" +
"		__dirname.pop();\n" +
"		__dirname = __dirname.join('/');\n" +
"\n" +
"		if(!cache[id]) {\n" +
"\n" +
"			// instantiate the module before executing it's code.\n" +
"			// this prevents infinite loops on circular dependencies\n" +
"			cache[id] = new Module(id, parent, dependencies);\n" +
"\n" +
"			var require = function() {\n" +
"				return cache[id].require.apply(cache[id], Array.prototype.slice.call(arguments));\n" +
"			};\n" +
"\n" +
"			require.cache = cache;\n" +
"\n" +
"			require.resolve = function() {\n" +
"				return cache[id].require.resolve.apply(cache[id].require,Array.prototype.slice.call(arguments));\n" +
"			};\n" +
"\n" +
"			cache[id] = (function(module) {\n" +
"\n" +
"				// unset variables to prevent accidental collisions\n" +
"				var dependencies = undefined, cache = undefined, parent = undefined, id = undefined, Module = undefined;\n" +
"\n" +
"\n" +
"				(function(module, require, exports) {\n" +
"\n" +
"					{{source}}\n" +
"\n" +
"				})(module, require, module.exports);\n" +
"\n" +
"				module.loaded = true;\n" +
"				return module;\n" +
"\n" +
"			})(cache[id]);\n" +
"		}\n" +
"\n" +
"		var ret = cache[id];\n" +
"\n" +
"		// clone this object and make the parent the currently calling module\n" +
"		if(ret.parent !== parent) {\n" +
"			ret = Object.create(ret);\n" +
"			ret.parent = parent;\n" +
"		}\n" +
"\n" +
"		return ret;\n" +
"	};\n" +
"}";
var dependenciesWrap = "(function(modules) {\n" +
"	var dependencies = {};\n" +
"\n" +
"	{{dependencies}}\n" +
"\n" +
"	var name = '{{name}}';\n" +
"	var id = '{{id}}';\n" +
"\n" +
"	modules[name] = dependency_cache[id](cache, dependencies);\n" +
"	modules[name].resolved = id;\n" +
"\n" +
"})(dependencies);\n" +
"";
var globalWrap = "(function() {\n" +
"\n" +
"	// Set up Node globals\n" +
"	var global = {},\n" +
"		console = window.console,\n" +
"		setTimeout = window.setTimeout,\n" +
"		clearTimeout = window.clearTimeout,\n" +
"		setInterval = window.setInterval,\n" +
"		clearInterval = window.clearInterval,\n" +
"		moduleNotFound = function(name) {\n" +
"			var err = new Error(\"Cannot find module '\" + name + \"'\");\n" +
"			err.code = 'MODULE_NOT_FOUND';\n" +
"			throw err;\n" +
"		},\n" +
"		// shim for process\n" +
"		// platform is linux because all we use it for is determining file hierarchy, which is posix\n" +
"		process = {\n" +
"			// this should probably be the directory of the entrypoint file, not the window\n" +
"			cwd: function() {\n" +
"				var href = window.location.pathname;\n" +
"				href = href.split('/');\n" +
"				href.pop();\n" +
"				return href.join('/') || '/';\n" +
"			},\n" +
"			platform: 'linux'\n" +
"		};\n" +
"\n" +
"	function Module(id, parent, dependencies) {\n" +
"		this.id = id;\n" +
"		this.filename = id;\n" +
"		this.exports = {};\n" +
"		this.loaded = false;\n" +
"		this.children = [];\n" +
"		this.parent = parent;\n" +
"		this.dependencies = dependencies;\n" +
"		this.require.dependencies = dependencies;\n" +
"\n" +
"		return this;\n" +
"	}\n" +
"\n" +
"	Module.prototype.require = function(name) {\n" +
"		if(typeof this.dependencies[name] !== 'function') {\n" +
"			moduleNotFound(name);\n" +
"		}\n" +
"\n" +
"		var childModule = this.dependencies[name](this);\n" +
"		this.children.push(childModule);\n" +
"		return childModule.exports;\n" +
"	};\n" +
"\n" +
"	Module.prototype.require.resolve = function(name) {\n" +
"		if(typeof this.dependencies[name] !== 'function') {\n" +
"			moduleNotFound(name);\n" +
"		}\n" +
"\n" +
"		return dependencies[name].resolved;\n" +
"	};\n" +
"\n" +
"	(function(dependency_cache) {\n" +
"		var cache = {},\n" +
"			dependencies = {},\n" +
"			scope = this;\n" +
"\n" +
"		var _require = require;\n" +
"\n" +
"		// require is intentionally not scoped\n" +
"		// in the browser-build, it falls onto the sandbox's declared require\n" +
"		// in the bundled build, it falls all the way to window.require\n" +
"		require = function(name) {\n" +
"\n" +
"			if(typeof dependencies[name] !== 'function') {\n" +
"				moduleNotFound(name);\n" +
"			}\n" +
"\n" +
"			return dependencies[name](scope).exports;\n" +
"		};\n" +
"\n" +
"		require.resolve = function(name) {\n" +
"			if(typeof dependencies[name] !== 'function') {\n" +
"				moduleNotFound(name);\n" +
"			}\n" +
"\n" +
"			return dependencies[name].resolved;\n" +
"		};\n" +
"\n" +
"		require.cache = cache;\n" +
"\n" +
"		require._events = _require._events,\n" +
"		require.fire = _require.fire,\n" +
"		require.ready = _require.ready;\n" +
"\n" +
"\n" +
"		{{dependencies}}\n" +
"\n" +
"\n" +
"	})({\n" +
"\n" +
"		{{cache}}\n" +
"\n" +
"	});\n" +
"})();\n" +
"";
var rootWrap = "dependencies['{{name}}'] = dependency_cache['{{id}}'](cache, dependencies);\n" +
"dependencies['{{name}}'].resolved = '{{id}}';\n" +
"";
var invoke = "require('{{name}}');";
var browserBuild = true;
if(typeof browserBuild === 'undefined') {
	var fs = require('fs'),
		cacheWrap = fs.readFileSync(__dirname + '/wrappers/cache-wrap.js', 'utf8'),
		dependenciesWrap = fs.readFileSync(__dirname + '/wrappers/dependencies-wrap.js', 'utf8'),
		globalWrap = fs.readFileSync(__dirname + '/wrappers/global-wrap.js', 'utf8'),
		rootWrap = fs.readFileSync(__dirname + '/wrappers/root-wrap.js', 'utf8'),
		invoke = fs.readFileSync(__dirname + '/../deployment/wrappers/invoke.js', 'utf8');
}

// cache of written dependencies
var writeCache = {};

// filter out single dollar signs from replacement text, and replace them with double dollar signs
// this will be rendered as a single due to the way that String#replace works
function dollarFilter(str) {
	return str.split('$').join('$$');
}


// Need a way to make all dependencies of a top level script available on window.require;
// Top level script therefore does not have a source to be wrapped

function Script(parent, dependencies, id, name, source) {
	this.parent = parent;
	this.id = id;
	this.name = name;
	this.source = source;
	this.dependencies = dependencies;
	this.cache = [];

	return this;
}

Script.prototype.write = function(cache, root) {
	var script = this;

	this.dependenciesSource = this.dependenciesSource || "";
	this.dependenciesFound = this.dependenciesFound || [this.id];
	this.dependencies.forEach(function(dependency) {
		if(!~script.dependenciesFound.indexOf(dependency.id)) {
			script.dependenciesFound.push(dependency.id);
			script.dependenciesSource += dependency.write(cache || script.cache);
		} else {
			//console.log("writing dependency root wrap", dependency.id);
			//script.dependenciesSource += dependency.rootWrap();
		}
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
	return  this.wrap();
};

Script.prototype.invoke = function() {
	return invoke
			.replace(/{{name}}/g, dollarFilter(this.name));
};

Script.prototype.addToCache = function(cache) {
	var wrapped;
	cache = cache || this.cache;

	wrapped = cacheWrap
				.replace(/{{id}}/g, dollarFilter(this.id))
				.replace(/{{source}}/g, dollarFilter(this.source));

	if(!!~cache.indexOf(wrapped)) {
		// don't add the same script twice
		return;
	}

	cache.push(wrapped);

	return wrapped;
};

Script.prototype.wrap = function() {
	return dependenciesWrap
			.replace(/{{id}}/g, dollarFilter(this.id))
			.replace(/{{name}}/g, dollarFilter(this.name))
			.replace(/{{dependencies}}/g, dollarFilter(this.dependenciesSource));
};

Script.prototype.rootWrap = function() {
	return rootWrap
			.replace(/{{id}}/g, dollarFilter(this.id))
			.replace(/{{name}}/g, dollarFilter(this.name));
};

Script.prototype.globalWrap = function() {
	return globalWrap
			.replace(/{{dependencies}}/g, dollarFilter(this.dependenciesSource))
			.replace(/{{cache}}/g, dollarFilter(this.cache.join(',')));
};

Script.prototype.clone = function() {
	return new Script(this.parent, this.dependencies, this.id, this.name, this.source);
};

if(typeof browserBuild === 'undefined') {
	module.exports = Script;
}var manifest_filename = "index.json",
	readFile,
	_exists,
	_stat,
	resolve,
	join,
	sep,
	fs,
	normalize,
	coreModules = [
		"assert",
		"buffer_ieee754",
		"buffer",
		"child_process",
		"cluster",
		"console",
		"constants",
		"crypto",
		"_debugger",
		"dgram",
		"dns",
		"domain",
		"events",
		"freelist",
		"fs",
		"http",
		"https",
		"_linklist",
		"module",
		"net",
		"os",
		"path",
		"punycode",
		"querystring",
		"readline",
		"repl",
		"stream",
		"string_decoder",
		"sys",
		"timers",
		"tls",
		"tty",
		"url",
		"util",
		"vm",
		"zlib"
	],
	isCore = function(name) {
		return !!~coreModules.indexOf(name);
	},
	loadedModules = {};

if(typeof browserBuild === 'undefined') {
	fs = new require('filequeue')();
	readFile = fs.readFile.bind(fs);
	_exists = fs.exists.bind(fs);
	_stat = fs.stat.bind(fs);
	resolve = require('path').resolve;
	join = require('path').join;
	sep = require('path').sep;
	normalize = require('path').normalize;
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

	// shim for object.create
	if (!Object.create) {
		Object.create = function (o) {
			if (arguments.length > 1) {
				throw new Error('Object.create implementation only accepts the first parameter.');
			}
			function F() {}
			F.prototype = o;
			return new F();
		};
	}

	// shim for process
	// platform is linux because all we use it for is determining file hierarchy, which is posix
	process = typeof process === 'undefined' ? {} : process;
	process.cwd = function() {
		var href = window.location.pathname;
		href = href.split('/');
		href.pop();
		return href.join('/') || '/';
	};
	process.platform = 'linux';

	// xhr
	var sendRequest = function(url, method, callback) {
		var req = createXMLHTTPObject();
		if (!req) return;
		req.open(method,url,true);
		req.onreadystatechange = function () {
			if (req.readyState != 4) return;
			callback(req);
		};
		if (req.readyState == 4) return;
		req.send();
	};

	var XMLHttpFactories = [
		function () {return new XMLHttpRequest();},
		function () {return new ActiveXObject("Msxml2.XMLHTTP");},
		function () {return new ActiveXObject("Msxml3.XMLHTTP");},
		function () {return new ActiveXObject("Microsoft.XMLHTTP");}
	];

	var createXMLHTTPObject = function() {
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
	};

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
	_exists = function(path, callback) {
		sendRequest(path, 'HEAD', function(req) {
			if(req.status === 200 || req.status === 304) {
				callback(true);
				return;
			}
			callback(false);
		});
	};
	_stat = function(path, callback) {
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

	//shim for path functions
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

	join = function() {
		var paths = Array.prototype.slice.call(arguments, 0);
		return normalize(paths.filter(function(p, index) {
		if (typeof p !== 'string') {
		throw new TypeError('Arguments to path.join must be strings');
		}
		return p;
		}).join('/'));
	};

	sep = '/';

	normalize = function(path) {
		var isAbsolute = path.charAt(0) === '/',
			trailingSlash = path.substr(-1) === '/';

		// Normalize the path
		path = normalizeArray(path.split('/').filter(function(p) {
			return !!p;
		}), !isAbsolute).join('/');

		if (!path && !isAbsolute) {
			path = '.';
		}
		if (path && trailingSlash) {
			path += '/';
		}

		return (isAbsolute ? '/' : '') + path;
	};

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	var normalizeArray = function(parts, allowAboveRoot) {
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
	};

}

function moduleNotFound(request) {
	var err = new Error("Cannot find module '" + request + "'");
	err.code = moduleNotFound.code;
	return err;
}

moduleNotFound.code = 'MODULE_NOT_FOUND';

moduleNotFound.is = function(err) {
	return err && err.code === this.code;
};

function parentDir(location) {
	var paths = location.split(sep);
	paths.pop();
	return paths.join(sep);
}

function isFile(name) {
	return (name[0] === '.' && name[1] === '/') || name[0] === '/';
}

function fileExt(name) {
	return name.slice(name.lastIndexOf('.'));
}
// Load up a hints file
var hints;

if(typeof browserBuild !== 'undefined') {

	var hints_locations = paths('__hints.json', resolve(''));

	var hints_loop = function(i) {
		if(!hints_locations[i]) {
			hints = false;
			return;
		}
		if(hints) {
			return;
		}
		exists(hints_locations[i], function(file_exists) {
			if(file_exists) {
				readFile(hints_locations[i], function(err, contents) {
					if(err) throw err;

					try {
						hints = JSON.parse(contents);
					} catch(e) {
						console.warn("hints file found, but not valid JSON");
						hints = false;
					}

				});
			} else {
				i++;
				hints_loop(i);
			}
		});
	};

	hints_loop(0);
}

function stat(file, callback) {
	if(hints) {
		callback(null, {
			isFile: function() {
				return !!~hints.files.indexOf(file);
			},
			isDirectory: function() {
				return !!~hints.directories.indexOf(file);
			}
		});
		return;
	}
	_stat(file, callback);
}

stat.hasIsDirectory = function () {
	return !!hints || (fs && fs.Stats && fs.Stats.prototype && typeof fs.Stats.prototype.isDirectory === 'function');
}

function exists(file, callback) {
	if(hints) {
		if(~hints.files.indexOf(file)) {
			callback(true);
			return;
		}
		if(~hints.directories.indexOf(file)) {
			callback(true);
			return;
		}
		callback(false);
		return;
	}
	_exists(file, callback);
}

// core should be key/value pairs of the name of the module and it's location. This is tricky for the browser side. Do we deliver all of the core modules into browser.js?
var core = {};

// given a path, create an array of node_module paths for it
// borrowed from substack/resolve
function nodeModulesPaths (start) {
    return paths('node_modules', start);
}

function paths(dirName, start) {
    var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\/+/;
    var parts = start.split(splitRe);

    var dirs = [];
    for (var i = parts.length - 1; i >= 0; i--) {
        if (parts[i] === dirName) continue;
        var dir = join(
            join.apply(this, parts.slice(0, i + 1)),
            dirName
        );
        if (!parts[0].match(/([A-Za-z]:)/)) {
            dir = '/' + dir;
        }
        dirs.push(dir);
    }
    return dirs;
}

function loadFile(name, location, callback, parent, isHtml) {

	return function(err, contents) {
		if(err) {
			callback(err);
			return;
		}

		var dependencies = findDependencies(contents, isHtml),
			script = new Script(parent, [], location, name, !!isHtml ? null : contents),
			done = function() {
				callback(null, script);
			},
			dependencyHandler = function(err, dependency) {
				if(err) {
					callback(err);
					callback = function() {};
					return;
				}

				script.dependencies.push(dependency);

				if(dependencies.length === script.dependencies.length) {
					// done loading dependencies
					done();
				}
			};

		if(!dependencies.length) {
			done();
			return;
		}

		dependencies.forEach(function(dep_location) {
			var dir = parentDir(location);

			// if this script has a dependency identical to itself or it's parent, just add a reference, don't try to load it again

			var found = [],
				_parent = script;

			// this has some issues - resolving does not always reveal the fully resolved filename
			if(isFile(dep_location)) {
				// for now, only check files (aka not node_modules) for circular dependencies. 
				// The way that resolve works makes a file included as  `/path/to/file` to collide with a reference in that file to `require('file')`
				while(_parent && _parent.id && !~found.indexOf(_parent.id)) {
					if(_parent.id === resolve(dir, dep_location)) {
						dependencyHandler(null, _parent);
						return;
					}
					_parent = _parent.parent;
				}
			}

			loadModule(dir, dep_location, dependencyHandler, false, script);
		});

	};
}

function loadJs(name, location, callback, parent) {
	return loadFile(name, location, callback, parent, false);
}

function loadHtml(name, location, callback, parent) {
	return loadFile(name, location, callback, parent, true);
}

function findDependencies(string, isHtml) {
	var matches = [],
		scripts = [],
		match,
		commentsRE = /(?:\/\*(?:[\s\S]*?)\*\/)|(?:\/\/(?:.*)$)/gm, // http://stackoverflow.com/a/15123777/2146744
		scriptRE = /<script(.|\s)*?>([\s\S]*?)<\/script>/g,
		requireRE = /require\(('|")(.*?)('|")\)/g;

	// if the html flag is set, only look in <script> tags
	if(isHtml) {
		// retrieve all the script bodies
		while((match = scriptRE.exec(string)) !== null) {
			scripts.push(match[2]);
		}
		// concatenate them so we can search for requires
		string = scripts.join("\n");
	}

	// remove all comments so we don't accidentally try to pull requires for them
	string = string.replace(commentsRE, '');

	// this doesn't actually make sure that the quotes are the same on both sides, just that it is quoted somehow
	while((match = requireRE.exec(string)) !== null) {
		matches.push(match[2]);
	}

	return matches;
}

// raw flag signifies that location is actually the raw contents of the entrypoint file
var loadModule = function(location, name, callback, raw, parent) {


	if(raw) {
		loadJs(name, './', callback, parent)(null, location);
		return;
	}

	resolveModule(location, name, function(err, resolved) {
		if(err) {
			callback(err);
			return;
		}

		if(loadedModules[resolved]) {
			var module = loadedModules[resolved].clone();
			module.name = name;
			module.parent = parent;
			module.dependenciesFound = [];
			callback(null,  module);
			return;
		}

		var cacheModule = function(err, module) {
			if(err) {
				callback(err);
				return;
			}
			loadedModules[resolved] = module;
			callback(null, module);
		};

		var ext = fileExt(resolved);

		if(ext === 'json') {
			readFile(resolved, 'utf8', function(err, contents) {
				if(err) {
					callback(err);
					return;
				}
				// export the parsed JSON in the browser
				cacheModule(null, new Script(parent, [], resolved, name, "module.exports = JSON.parse('" + contents.replace(/'/g, "\'").replace(/\n/g, " ") + "');"));
			});
			return;
		}

		if(ext === 'html') {
			readFile(resolved, loadHtml(name, resolved, cacheModule, parent));
			return;
		}

		readFile(resolved, 'utf8', loadJs(name, resolved, cacheModule, parent));

	});
};

function resolveModule(location, name, callback) {
	var resolved = resolve(location, name);

	if(isFile(name)) {
		// local reference
		// check for exact filename or directory name match
		exists(resolved, function(file_exists) {
			if(file_exists) {

				stat(resolved, function(err, stats) {
					if(err) {
						callback(err);
						return;
					}

					if(stats.isDirectory()) {
						resolveAsDir(resolved, function(err, resolved_dir) {
							if(moduleNotFound.is(err)) {
								resolveVariations(resolved, function(err, resolved_file) {
									if(moduleNotFound.is(err)) {
										callback(moduleNotFound(name));
										return;
									}
									callback(err, resolved_file);
								});
								return;
							}
							callback(err, resolved_dir);
						});
						return;
					}

					if(stats.isFile()) {
						// an exact filename match
						callback(null, resolved);
						return;
					}

					callback(new Error("Object is neither a file nor a directory."));
				});
			} else {

				if(!stat.hasIsDirectory) {
					// if this environment doesn't have support for fs.Stat#isDirectory, assume that it is a directory until proven otherwise.
					// aka the browser without a hinting file
					resolveAsDir(resolved, function(err, resolved_dir) {
						if(moduleNotFound.is(err)) {

							// check this as a file
							resolveVariations(resolved, function(err, resolved_file) {
								if(moduleNotFound.is(err)) {
									callback(moduleNotFound(name));
									return;
								}
								callback(err, resolved_file);
							});
							return;
						}
						callback(err, resolved_dir);
					});
				} else {

					// check for file variations since this is not a directory
					resolveVariations(resolved, function(err, resolved_file) {
						if(moduleNotFound.is(err)) {
							callback(moduleNotFound(name));
							return;
						}
						callback(err, resolved_file);
					});

				}
			}
		});
	} else {
		// built-in or node_module
		if(isCore(name)) {
			// built-in
			if(!core[name]) {
				callback(new Error(name + " is not implemented."));
			}

			callback(null, core[name]);
			return;
		}

		// node_module
		// http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders
		var paths = nodeModulesPaths(resolve(location));
		var pathLoop = function(i) {
			if(!paths[i]) {
				callback(moduleNotFound(name));
				return;
			}
			resolveModule(paths[i], './' + name, function(err, resolvedModule) {
				if(err) {
					if(moduleNotFound.is(err)) {
						pathLoop(i+1);
					} else {
						callback(err);
					}
					return;
				}
				callback(null, resolvedModule);
			});
		};

		pathLoop(0);
	}
}

function resolveAsDir(dir, callback) {
	// look for package.json
	exists(resolve(dir, "package.json"), function(pkg_exists) {
		if(pkg_exists) {
			readFile(resolve(dir, "package.json"), "utf8", function(err, raw) {
				var pkg,
					main;

				if(err) {
					callback(err);
					return;
				}

				try {
					pkg = JSON.parse(raw);
				} catch(e) {
					callback(e);
					return;
				}

				if(pkg && pkg.main) {
					main = pkg.main;

					if(Array.isArray(pkg.main)) {
						main = main[0];
					}

					exists(resolve(dir, main), function(file_exists) {
						if(file_exists) {
							callback(null, resolve(dir, main));
							return;
						}

						resolveVariations(resolve(dir, main), callback);
					});
					return;
				}

				callback(moduleNotFound(dir));
			});

			return;
		}

		// look for index file
		exists(resolve(dir, "index"), function(file_exists) {
			if(file_exists) {
				callback(null, resolve(dir, "index"));
				return;
			}

			exists(resolve(dir, "index.js"), function(file_exists) {
				if(file_exists) {
					callback(null, resolve(dir, "index.js"));
					return;
				}

				exists(resolve(dir, "index.html"), function(file_exists) {
					if(file_exists) {
						callback(null, resolve(dir, "index.js"));
						return;
					}

					callback(moduleNotFound(dir));

				});

			});

		});
	});
}

function resolveVariations(name, callback) {
	// no exact match, check for variations
	exists(name + '.js', function(file_exists) {
		if(file_exists) {
			callback(null, name + '.js');
			return;
		}

		exists(name + '.json', function(file_exists) {
			if(file_exists) {
				callback(null, name + '.json');
				return;
			}

			exists(name + '.html', function(file_exists) {
				if(file_exists) {
					callback(null, name + '.html');
					return;
				}

				callback(moduleNotFound(name));
			});
		});
	});
}

if(typeof browserBuild === 'undefined') {
	module.exports = loadModule;
}// load the data-main script

var loadMain = function(main) {
	var location = './';
	if(main) {
		if(typeof loadModule !== 'function' || hints === undefined) {
			window.setTimeout(function() {
				loadMain(main);
			}, 10);
			return;
		}

		if(main[0] !== '.' && main[0] !== '/') {
			main = './'+main;
		}
		if(main[0] === '/') {
			location = '/';
		}
		loadModule(location, main, writeModule);
	}
};

var writeModule = function(err, module) {
	if(err) throw err;

	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.text = '(function() { var require = {ready:window.require.ready, fire:window.require.fire};\n' + module.write(null, true) + module.invoke() + '})(); \n\n //@ sourceURL='+module.id+'.joules';
	try {
		window.document.getElementsByTagName('head')[0].appendChild(script);
	} catch(e) {
		console.log("Couldn't append script:");
		console.log(script.innerText);
		throw e;
	}
};

var scripts = window.document.getElementsByTagName("script");
var script = scripts[scripts.length - 1];
loadMain(script.getAttribute('data-main'));


window.require = function() {
	throw new Error("Can't call require outside of require.ready");
};

window.require.fire = function(evt) {
};

window.require.ready = function(fn) {

	var whole = fn.toString();
	var body = whole.substring(whole.indexOf('{')+1, whole.lastIndexOf('}'));

	loadModule(body, Math.round(Math.random()*10000).toString(), writeModule, true);
};
})();