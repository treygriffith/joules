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

	

	modules['./js/value'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/value'](cache, dependencies);

})(dependencies);(function(modules) {
	var dependencies = {};

	(function(modules) {
	var dependencies = {};

	

	modules['./monkeys'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world/monkeys'](cache, dependencies);

})(dependencies);

	modules['./js/world'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world'](cache, dependencies);

})(dependencies);(function(modules) {
	var dependencies = {};

	(function(modules) {
	var dependencies = {};

	

	modules['game'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/node_modules/game'](cache, dependencies);

})(dependencies);

	modules['./js/hello'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/hello'](cache, dependencies);

})(dependencies);


})({

	'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/value' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/value']) {
			cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/value'] = (function(module) {
				var dependencies = undefined, cache = undefined, parent = undefined;

				(function(module, require, exports) {

					module.exports = JSON.parse('{ 	"my": "Value" }');

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
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/value',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/value'];
	};
},'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world/monkeys' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world/monkeys']) {
			cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world/monkeys'] = (function(module) {
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
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world/monkeys',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world/monkeys'];
	};
},'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world']) {
			cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world'] = (function(module) {
				var dependencies = undefined, cache = undefined, parent = undefined;

				(function(module, require, exports) {

					var monkeys = require('./monkeys');

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
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/world'];
	};
},'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/node_modules/game' : function(cache, dependencies) {
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
				id:'/Users/treygriffith/Dropbox/Node/jewels/example/static/js/hello',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['/Users/treygriffith/Dropbox/Node/jewels/example/static/js/hello'];
	};
}

});
window.require.fire('ready');