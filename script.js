if(typeof browserBuild === 'undefined') {
	var fs = require('fs'),
		cacheWrap = fs.readFileSync('./wrappers/cache-wrap.js', 'utf8'),
		dependenciesWrap = fs.readFileSync('./wrappers/dependencies-wrap.js', 'utf8'),
		globalWrap = fs.readFileSync('./wrappers/global-wrap.js', 'utf8'),
		rootWrap = fs.readFileSync('./wrappers/root-wrap.js', 'utf8'),
		invoke = fs.readFileSync('./wrappers/invoke.js', 'utf8');
}


// Need a way to make all dependencies of a top level script available on window.require;
// Top level script therefore does not have a source to be wrapped

function Script(dependencies, id, name, source) {
	this.id = id;
	this.name = name;
	this.source = source;
	this.dependencies = dependencies;
	this.cache = [];

	return this;
}

Script.prototype.write = function(cache, root) {
	var script = this;

	this.dependenciesSource = "";
	this.dependencies.forEach(function(dependency) {
		script.dependenciesSource += dependency.write(cache || script.cache);
	});

	if(root) {
		// writing as root script
		if(this.source) {
			this.addToCache(cache);
			this.dependenciesSource += this.rootWrap();
		}
		return this.globalWrap();
	}

	// writing as a dependency
	this.addToCache(cache);
	return this.wrap();
};

Script.prototype.invoke = function() {
	return invoke
			.replace(/{{name}}/g, this.name);
};

Script.prototype.addToCache = function(cache) {
	var wrapped;
	cache = cache || this.cache;

	wrapped = cacheWrap
				.replace(/{{id}}/g, this.id)
				.replace(/{{source}}/g, this.source);

	if(!!~cache.indexOf(wrapped)) {
		// don't add the same script twice
		return;
	}
	cache.push(wrapped);

	return wrapped;
};

Script.prototype.wrap = function() {
	return dependenciesWrap
			.replace(/{{id}}/g, this.id)
			.replace(/{{name}}/g, this.name)
			.replace(/{{dependencies}}/g, this.dependenciesSource);
};

Script.prototype.rootWrap = function() {
	return rootWrap
			.replace(/{{id}}/g, this.id)
			.replace(/{{name}}/g, this.name);
};

Script.prototype.globalWrap = function() {
	return globalWrap
			.replace(/{{dependencies}}/g, this.dependenciesSource)
			.replace(/{{cache}}/g, this.cache);
};

if(typeof browserBuild === 'undefined') {
	module.exports = Script;
}