'{{id}}' : function(cache, dependencies) {
	return function(parent) {
		if(!cache['{{id}}']) {
			cache['{{id}}'] = (function(module) {
				var dependencies = undefined, cache = undefined, parent = undefined;

				(function(module, require, exports) {

					{{source}}

				})(module, function() {
					return module.require.apply(module, Array.prototype.slice.call(arguments));
				}, module.exports);

				module.loaded = true;
				return module;
			})({
				require: function(name, assignment) {
					if(typeof dependencies[name] !== 'function') {
						throw new Error("Module Not Found");
					}
					var childModule = dependencies[name](this);
					this.children.push(childModule);
					return childModule.exports;
				},
				exports: {},
				id:'{{id}}',
				loaded:false,
				children: [],
				parent: parent
			});
		}
		return cache['{{id}}'];
	};
}