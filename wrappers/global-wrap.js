(function(dependency_cache) {
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
	window.require.ready = _require.ready;


	{{dependencies}}


})({

	{{cache}}

});
