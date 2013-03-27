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


	{{dependencies}}


})({

	{{cache}}

});