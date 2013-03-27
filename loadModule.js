var manifest_filename = "index.json",
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

		console.log(dependencies);

		if(!dependencies.length) {
			done();
			return;
		}

		dependencies.forEach(function(dep_location) {

			console.log("dependency resolved to " + resolve(location, dep_location));

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
	console.log(location);
	// look for a package.json
	exists(resolve(location, 'package.json'), function(file_exists) {
		if(file_exists) {
			// parse json to find main
			// 
			console.log(resolve(location, 'package.json') + " found, reading");
			
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

				console.log("loading main at "+resolve(location, manifest.main));

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

				// No module found
				// build a Script that throws an error
				console.log("no module found, building a time bomb");
				callback(null, new Script([], resolve(location), name, 'throw new Error("Module Not Found");'));
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

				console.log(location + " exists!");

				// determine if this is a directory
				stat(location, function(err, stats) {
					if(err) {
						callback(err);
						return;
					}

					if(stats.isDirectory()) {
						console.log(location + "is a directory");
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
						readFile(location + '.json', function(err, contents) {
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
		console.log("core module "+location);
		throw new Error("core modules not implemented");
	}
}

if(typeof browserBuild === 'undefined') {
	module.exports = loadModule;
}