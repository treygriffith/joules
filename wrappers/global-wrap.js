(function(dependency_cache) {
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


	{{dependencies}}


})({

	{{cache}}

});
