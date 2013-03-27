(function(modules) {
	var dependencies = {};

	// Begin Nested dependencies
	{{dependencies}}
	// End Nested dependencies

	modules['{{name}}'] = dependency_cache['{{id}}'](cache, dependencies);

})(dependencies);