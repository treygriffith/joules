var manifest_filename = "index.json",
	readFile,
	exists,
	resolve;

if(typeof browserBuild === 'undefined') {
	readFile = require('fs').readFile;
	exists = require('fs').exists;
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
			return href.join('/');
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

function loadModule(location, name, callback) {

	exists(resolve(location, manifest_filename), function(does_exist) {

		if(does_exist) {
			readFile(resolve(location, manifest_filename), 'utf8', function(err, raw) {
				var manifest,
					dependencies = [],
					dependencies_count = 0,
					main,
					loaded = {
						deps: false,
						main: false
					},
					allLoaded = function() {
						return loaded.deps && loaded.main;
					},
					done = function() {
						callback(null, new Script(dependencies, resolve(location), name, main));
					};

				if(err) throw err;

				try {
					manifest = JSON.parse(raw);
				} catch(e) {
					throw e;
				}

				if(manifest.dependencies) {
					for(var p in manifest.dependencies) {
						dependencies_count++;
					}


					for(var dep_name in manifest.dependencies) {
						var dep_location = manifest.dependencies[dep_name],
							dep_id = resolve(location, dep_location);

						loadModule(dep_id, dep_name, function(err, dependency) {
							dependencies.push(dependency);

							if(dependencies.length === dependencies_count) {
								// done loading dependencies
								loaded.deps = true;
								if(allLoaded()) {
									done();
								}
							}
						});

					}				
				} else {
					loaded.deps = true;
					if(allLoaded()) {
						done();
					}
				}

				if(manifest.main) {
					readFile(resolve(location, manifest.main), 'utf8', function(err, contents) {
						if(err) throw err;

						main = contents;

						loaded.main = true;
						if(allLoaded()) {
							done();
						}
					});
				} else {
					loaded.main = true;
					if(allLoaded()) {
						done();
					}
				}

			});
		} else {
			exists(resolve(location), function(file_exists) {
				if(file_exists) {
					readFile(resolve(location), 'utf8', function(err, contents) {
						if(err) throw err;

						callback(null, new Script([], resolve(location), name, contents));
					});	
				} else {
					throw new Error("Module does not exist");
				}
			});

		}

	});
}

if(typeof browserBuild === 'undefined') {
	module.exports = loadModule;
}