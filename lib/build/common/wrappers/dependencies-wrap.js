(function(modules) {
	var dependencies = {};

	{{dependencies}}

	var name = '{{name}}';
	var id = '{{id}}';

	modules[name] = dependency_cache[id](cache, dependencies);
	modules[name].resolved = id;

})(dependencies);
