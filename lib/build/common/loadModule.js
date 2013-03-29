var manifest_filename = "index.json",
	readFile,
	exists,
	stat,
	resolve,
	join,
	sep,
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
	readFile = require('fs').readFile;
	exists = require('fs').exists;
	stat = require('fs').stat;
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
	process = {
		cwd: function() {
			var href = window.location.pathname;
			href = href.split('/');
			href.pop();
			return href.join('/') || '/';
		},
		platform: 'linux'
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


function parentDir(location) {
	var paths = location.split(sep);
	paths.pop();
	return paths.join(sep);
}

function isFile(name) {
	return name[0] === '.' || name[0] === '/';
};

// core should be key/value pairs of the name of the module and it's location. This is tricky for the browser side. Do we deliver all of the core modules into browser.js?
var core = {};

// given a path, create an array of node_module paths for it
// borrowed from substack/resolve
function nodeModulesPaths (start) {
    var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\/+/;
    var parts = start.split(splitRe);

    var dirs = [];
    for (var i = parts.length - 1; i >= 0; i--) {
        if (parts[i] === 'node_modules') continue;
        var dir = join(
            join.apply(this, parts.slice(0, i + 1)),
            'node_modules'
        );
        if (!parts[0].match(/([A-Za-z]:)/)) {
            dir = '/' + dir;
        }
        dirs.push(dir);
    }
    return dirs;
}

function loadFile(name, location, callback, parent, isDirectory, isHtml) {

	return function(err, contents) {
		if(err) {
			callback(err);
			return;
		}

		var dependencies = findDependencies(contents, isHtml),
			script = new Script(parent, [], resolve(location), name, !!isHtml ? null : contents),
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

		console.log("dependencies for "+name+" in "+location+": ",dependencies);

		dependencies.forEach(function(dep_location) {
			var dir, locations;
			if(isDirectory) {
				dir = location;
			} else {
				locations = location.split(sep);
				locations.pop();
				dir = locations.join(sep);
			}

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

function loadJs(name, location, callback, parent, isDirectory) {
	return loadFile(name, location, callback, parent, isDirectory, false);
}

function loadHtml(name, location, callback, parent, isDirectory) {
	return loadFile(name, location, callback, parent, isDirectory, true);
}

function loadDir(name, location, callback, parent) {

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
				// the location should be the same as the directory that the main file is in, not the location of the manifest itself.
				// this prevents main files in deeper directories, like 'lib/my_lib.js' from not being able to require realtive directories
				readFile(resolve(location, manifest.main), 'utf8', loadJs(name, parentDir(resolve(location, manifest.main)), callback, parent, true));
			});

			return;
		}

		// look for an index file
		
		exists(resolve(location, 'index'), function(file_exists) {
			if(file_exists) {
				// index is our entry point
				readFile(resolve(location, 'index'), 'utf8', loadJs(name, location, callback, parent, true));
				return;
			}

			exists(resolve(location, 'index.js'), function(file_exists) {
				if(file_exists) {
					// index.js is our entry point
					readFile(resolve(location, 'index.js'), 'utf8', loadJs(name, location, callback, parent, true));
					return;
				}

				// look for an index.html file
				// NOTE: the .html extension is hardcoded in now, but it probably makes sense to make this a
				// parameter so that other templates can be searched (e.g. .jade, .erb)
				exists(resolve(location, 'index.html'), function(file_exists) {
					if(file_exists) {
						readFile(resolve(location, 'index.html'), 'utf8', loadHtml(name, location, callback, parent, true));
						return;
					}

					// No module found - throw this error at build time, not runtime
					callback(new Error("Module Not Found: "+location));
				});
			});
		});
	});	
}

function load(location, name, _callback, parent) {
	if(loadedModules[location]) {
		var module = Object.create(loadedModules[location]);
		module.name = name;
		module.parent = parent;
		_callback(null,  module);
	}

	var callback = function(err, module) {
		if(err) {
			_callback(err);
			return;
		}
		loadedModules[location] = module;
		_callback(null, module);
	};

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
					loadDir(name, location, callback, parent);
					return;
				}

				if(!stats.isFile()) {
					throw new Error("Module is not a file or a directory");
				}

				// exact filename exists, parse as javascript
				readFile(location, 'utf8', loadJs(name, location, callback, parent));
			});
			
			return;
		}

		exists(location + '.js', function(file_exists) {
			if(file_exists) {
				// .js appended, parse as javascript
				readFile(location + '.js', 'utf8', loadJs(name, location, callback, parent));
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
						callback(null, new Script(parent, [], location, name, "module.exports = JSON.parse('" + contents.replace(/'/g, "\'").replace(/\n/g, " ") + "');"));
					});
					
					return;
				}

				// check if it is html
				// NOTE: the .html extension is hardcoded in now, but it probably makes sense to make this a
				// parameter so that other templates can be searched (e.g. .jade, .erb)
				exists(location + '.html', function(file_exists) {
					if(file_exists) {
						readFile(location + '.html', loadHtml(name, location, callback, parent));

						return;
					}
				});

				// treat this as a directory
				loadDir(name, location, callback, parent);

			});
		});
	});
}


function findDependencies(string, isHtml) {
	var matches = [],
		scripts = [],
		match,
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

	// this doesn't actually make sure that the quotes are the same on both sides, just that it is quoted somehow
	while((match = requireRE.exec(string)) !== null) {
		matches.push(match[2]);
	}

	return matches;
}

// raw flag signifies that location is actually the raw contents of the entrypoint file
var loadModule = function(location, name, callback, raw, parent) {
	console.log("loading "+name+", in location: "+location);

	if(raw) {
		loadJs(name, './', callback, parent)(null, location);
		return;
	}


	if(isFile(name)) {
		// this is a file
		load(resolve(location, name), name, function(err, module) {
			if(err){
				callback(err);
				return;
			}
			// save the module to the cache
			loadedModules[resolve(location, name)] = module;

			callback(null, module);
		}, parent);

	} else if(isCore(name)) {
		// core module
		if(core[name]) {
			if(loadedModules[name]) {
				callback(null, loadedModules[name]);
				return;
			}
			readFile(core[name], 'utf8', loadJs(name, name, function(err, module) {
				if(err) {
					callback(err);
					return;
				}
				loadedModules[name] = module;
			}, parent));
			return;
		}
		throw new Error("Core Module: "+name+ " is not implemented.");
			
	} else {
		// node_modules
		// http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders
		var paths = nodeModulesPaths(resolve(location));

		var tryLoad = function(i) {
			if(!paths[i]) {
				callback(new Error("Module Not Found: "+name));
				return;
			}
			console.log("trying path ",resolve(paths[i], name));
			load(resolve(paths[i], name), name, function(err, module) {
				if(err) {
					if(err.message.substring(0, "Module Not Found: ".length) === "Module Not Found: ") {
						i++;
						tryLoad(i);
						return;
					}
					callback(err);
					return;
				}
				callback(null, module);
			}, parent);	
		};

		tryLoad(0);
	}
};

if(typeof browserBuild === 'undefined') {
	module.exports = loadModule;
}