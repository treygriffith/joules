(function(modules) {
	var dependencies = {};

	{{dependencies}}

	modules['{{name}}'] = dependency_cache['{{id}}'](cache, dependencies);
	modules['{{name}}'].resolved = '{{id}}';

})(dependencies);
