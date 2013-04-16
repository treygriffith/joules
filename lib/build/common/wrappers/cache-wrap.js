'{{id}}' : function(cache, dependencies) {
	return function(parent) {

		var id = '{{id}}';

		// Set up Module specific 'globals'
		var __filename = id, __dirname = __filename.split('/');
		__dirname.pop();
		__dirname = __dirname.join('/');

		if(!cache[id]) {

			// instantiate the module before executing it's code.
			// this prevents infinite loops on circular dependencies
			cache[id] = new Module(id, parent, dependencies);

			var require = function() {
				return cache[id].require.apply(cache[id], Array.prototype.slice.call(arguments));
			};

			require.cache = cache;

			require.resolve = function() {
				return cache[id].require.resolve.apply(cache[id].require,Array.prototype.slice.call(arguments));
			};

			cache[id] = (function(module) {

				// unset variables to prevent accidental collisions
				var dependencies = undefined, cache = undefined, parent = undefined, id = undefined, Module = undefined;


				(function(module, require, exports) {

					{{source}}

				})(module, require, module.exports);

				module.loaded = true;
				return module;

			})(cache[id]);
		}

		var ret = cache[id];

		// clone this object and make the parent the currently calling module
		if(ret.parent !== parent) {
			ret = Object.create(ret);
			ret.parent = parent;
		}

		return ret;
	};
}