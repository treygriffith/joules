(function(dependency_cache) {
	var cache = {},
		dependencies = {};

	var _require = require;

	// require is intentionally not scoped
	// in the browser-build, it falls onto the sandbox's declared require
	// in the bundled build, it falls all the way to window.require
	require = function(name) {

		if(typeof dependencies[name] !== 'function') {
			throw new Error('Module Not Found');
		}

		return dependencies[name](this).exports;
	};

	require._events = _require._events,
	require.fire = _require.fire,
	require.ready = _require.ready;


	{{dependencies}}


})({

	{{cache}}

});
