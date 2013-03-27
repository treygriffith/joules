window.require = function() {
	throw new Error("Can't call require outside of require.ready");
};

window.require._events = {};

window.require.fire = function(evt) {
	if(this._events[evt] && this._events[evt].length) {
		this._events[evt].forEach(function(fn) {
			fn.call(window);
		});
	}
	if(evt === 'ready') {
		this.ready = function(fn) {
			fn.call(window);
		};
	}
};

window.require.ready = function(fn) {
	this._events.ready = this._events.ready || [];
	this._events.ready.push(fn);
};(function(dependency_cache) {
	var cache = {},
		dependencies = {};

	var _require = require;

	// require is intentionally not scoped
	// in the browser-build, it falls onto the sandbox's declared require
	// in the bundled build, it falls all the way to window.require
	require = function(name) {
		var module;

		if(typeof dependencies[name] !== 'function') {
			throw new Error('Module Not Found');
		}

		module = dependencies[name](this);

		module.parent = this;

		return module.exports;
	};

	require._events = _require._events,
	require.fire = _require.fire,
	require.ready = _require.ready;


	(function(modules) {
	var dependencies = {};

	(function(modules) {
	var dependencies = {};

	

	modules['game'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/node_modules/game'](cache, dependencies);

})(dependencies);

	modules['./hello'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/hello'](cache, dependencies);

})(dependencies);dependencies['./'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/main.js'](cache, dependencies);


})({

	'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/node_modules/game' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/node_modules/game']) {
			cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/node_modules/game'] = (function(module) {
				var dependencies = undefined, cache = undefined, parent = undefined;

				(function(module, require, exports) {

					module.exports = function() {
	console.log("I like this game.");
};

				})(module, function() {
					return module.require.apply(module, Array.prototype.slice.call(arguments));
				}, module.exports);

				module.loaded = true;
				return module;
			})({
				require: function(name, assignment) {
					if(typeof dependencies[name] !== 'function') {
						throw new Error('Module Not Found');
					}
					var childModule = dependencies[name](this);
					this.children.push(childModule);
					return childModule.exports;
				},
				exports: {},
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/node_modules/game',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/node_modules/game'];
	};
},'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/hello' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/hello']) {
			cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/hello'] = (function(module) {
				var dependencies = undefined, cache = undefined, parent = undefined;

				(function(module, require, exports) {

					require('game')();

module.exports = "hello world";

				})(module, function() {
					return module.require.apply(module, Array.prototype.slice.call(arguments));
				}, module.exports);

				module.loaded = true;
				return module;
			})({
				require: function(name, assignment) {
					if(typeof dependencies[name] !== 'function') {
						throw new Error('Module Not Found');
					}
					var childModule = dependencies[name](this);
					this.children.push(childModule);
					return childModule.exports;
				},
				exports: {},
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/hello',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/hello'];
	};
},'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/main.js' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/main.js']) {
			cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/main.js'] = (function(module) {
				var dependencies = undefined, cache = undefined, parent = undefined;

				(function(module, require, exports) {

					
document.getElementById("title").textContent = require('./hello');

				})(module, function() {
					return module.require.apply(module, Array.prototype.slice.call(arguments));
				}, module.exports);

				module.loaded = true;
				return module;
			})({
				require: function(name, assignment) {
					if(typeof dependencies[name] !== 'function') {
						throw new Error('Module Not Found');
					}
					var childModule = dependencies[name](this);
					this.children.push(childModule);
					return childModule.exports;
				},
				exports: {},
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/main.js',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/main.js'];
	};
}

});
window.require('./');
window.require.fire('ready');