window.require = function() {};

window.require._events = {};

window.require.fire = function(evt) {
	if(this._events[evt] && this._events[evt].length) {
		this._events[evt].forEach(function(fn) {
			fn.call(window);
		});
	}
};

window.require.ready = function(fn) {
	this._events.ready = this._events.ready || [];
	this._events.ready.push(fn);
};(function(dependency_cache) {
	var cache = {},
		dependencies = {};

	var _require = window.require;

	window.require = function(name) {
		var module;

		if(typeof dependencies[name] !== 'function') {
			throw new Error('Module Not Found');
		}

		module = dependencies[name](this);

		module.parent = this;

		return module.exports;
	};

	window.require._events = _require._events,
	window.require.fire = _require.fire,
	window.require.ready = function(fn) {
		fn.call(window);
	};


	(function(modules) {
	var dependencies = {};

	

	modules['hello'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/hello.js'](cache, dependencies);

})(dependencies);(function(modules) {
	var dependencies = {};

	(function(modules) {
	var dependencies = {};

	

	modules['monkeys'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/world/monkeys.js'](cache, dependencies);

})(dependencies);

	modules['world'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/world'](cache, dependencies);

})(dependencies);


})({

	'/Users/treygriffith/Dropbox/Node/jewels/example/hello.js' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['/Users/treygriffith/Dropbox/Node/jewels/example/hello.js']) {
			cache['/Users/treygriffith/Dropbox/Node/jewels/example/hello.js'] = (function(module) {
				var dependencies = undefined, cache = undefined, parent = undefined;

				(function(module, require, exports) {

					module.exports = function() {
	console.log("hello world!");
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
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/hello.js',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/hello.js'];
	};
},'/Users/treygriffith/Dropbox/Node/jewels/example/world/monkeys.js' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['/Users/treygriffith/Dropbox/Node/jewels/example/world/monkeys.js']) {
			cache['/Users/treygriffith/Dropbox/Node/jewels/example/world/monkeys.js'] = (function(module) {
				var dependencies = undefined, cache = undefined, parent = undefined;

				(function(module, require, exports) {

					exports.names = "brian, scott, paul";

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
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/world/monkeys.js',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/world/monkeys.js'];
	};
},'/Users/treygriffith/Dropbox/Node/jewels/example/world' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['/Users/treygriffith/Dropbox/Node/jewels/example/world']) {
			cache['/Users/treygriffith/Dropbox/Node/jewels/example/world'] = (function(module) {
				var dependencies = undefined, cache = undefined, parent = undefined;

				(function(module, require, exports) {

					var monkeys = require('monkeys');

console.log(monkeys.names);

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
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/world',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/world'];
	};
}

});

window.require.fire('ready');