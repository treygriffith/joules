'{{id}}' : function(cache, dependencies) {
	return function(parent) {

		var id = '{{id}}';

		if(!cache[id]) {

			// instantiate the module before executing it's code.
			// this prevents infinite loops on circular dependencies
			cache[id] = {
				require: function(name) {
					if(typeof dependencies[name] !== 'function') {
						throw new Error('Module Not Found: '+name);
					}

					var childModule = dependencies[name](this);
					this.children.push(childModule);
					return childModule.exports;
				},
				exports: {},
				id: id,
				filename: id,
				loaded: false,
				children: [],
				parent: parent
			};

			cache[id] = (function(module) {

				var dependencies = undefined, cache = undefined, parent = undefined;


				(function(module, require, exports) {

					{{source}}

				})(module, function() {

					return module.require.apply(module, Array.prototype.slice.call(arguments));

				}, module.exports);

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