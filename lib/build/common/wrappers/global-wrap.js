(function() {

	// Set up Node globals
	var global = {},
		console = window.console,
		setTimeout = window.setTimeout,
		clearTimeout = window.clearTimeout,
		setInterval = window.setInterval,
		clearInterval = window.clearInterval,
		moduleNotFound = function(name) {
			var err = new Error("Cannot find module '" + name + "'");
			err.code = 'MODULE_NOT_FOUND';
			throw err;
		},
		// shim for process
		// platform is linux because all we use it for is determining file hierarchy, which is posix
		process = {
			// this should probably be the directory of the entrypoint file, not the window
			cwd: function() {
				var href = window.location.pathname;
				href = href.split('/');
				href.pop();
				return href.join('/') || '/';
			},
			platform: 'linux'
		};

	function Module(id, parent, dependencies) {
		this.id = id;
		this.filename = id;
		this.exports = {};
		this.loaded = false;
		this.children = [];
		this.parent = parent;
		this.dependencies = dependencies;
		this.require.dependencies = dependencies;

		return this;
	}

	Module.prototype.require = function(name) {
		if(typeof this.dependencies[name] !== 'function') {
			moduleNotFound(name);
		}

		var childModule = this.dependencies[name](this);
		this.children.push(childModule);
		return childModule.exports;
	};

	Module.prototype.require.resolve = function(name) {
		if(typeof this.dependencies[name] !== 'function') {
			moduleNotFound(name);
		}

		return dependencies[name].resolved;
	};

	(function(dependency_cache) {
		var cache = {},
			dependencies = {},
			scope = this;

		var _require = require;

		// require is intentionally not scoped
		// in the browser-build, it falls onto the sandbox's declared require
		// in the bundled build, it falls all the way to window.require
		require = function(name) {

			if(typeof dependencies[name] !== 'function') {
				moduleNotFound(name);
			}

			return dependencies[name](scope).exports;
		};

		require.resolve = function(name) {
			if(typeof dependencies[name] !== 'function') {
				moduleNotFound(name);
			}

			return dependencies[name].resolved;
		};

		require.cache = cache;

		require._events = _require._events,
		require.fire = _require.fire,
		require.ready = _require.ready;


		{{dependencies}}


	})({

		{{cache}}

	});
})();
