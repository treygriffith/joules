(function(dependency_cache) {
	var cache = {},
		dependencies = {};

	window.require = function(name) {
		var module;

		if(typeof dependencies[name] !== 'function') {
			throw new Error("Module Not Found");
		}

		module = dependencies[name](this);

		module.parent = this;

		return module.exports;
	};


	(function(modules) {
	var dependencies = {};

	// Begin Nested dependencies
	
	// End Nested dependencies

	modules['hello'] = dependency_cache['/Users/treygriffith/Dropbox/Node/jewels/example/hello.js'](cache, dependencies);

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
						throw new Error("Module Not Found");
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
}

});