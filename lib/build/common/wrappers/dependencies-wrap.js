(function(modules) {
	var dependencies = {};

	{{dependencies}}

	modules['{{name}}'] = dependency_cache['{{id}}'](cache, dependencies);

})(dependencies);
