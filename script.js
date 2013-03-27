var fs = require('fs'),
	util = require('util'),
	events = require('events'),
	cacheWrap = fs.readFileSync('./wrappers/cache-wrap.js', 'utf8'),
	dependenciesWrap = fs.readFileSync('./wrappers/dependencies-wrap.js', 'utf8'),
	globalWrap = fs.readFileSync('./wrappers/global-wrap.js', 'utf8');


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

util.inherits(Script, events.EventEmitter);

Script.prototype.write = function(cache) {
	var script = this;

	this.dependenciesSource = "";
	this.dependencies.forEach(function(dependency) {
		script.dependenciesSource += dependency.write(cache || script.cache);
	});

	if(!this.source) {
		// writing as a top-level script
		return this.globalWrap();
	} else {
		// writing as a dependency
		this.addToCache(cache);
		return this.wrap();
	}
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

Script.prototype.globalWrap = function() {
	return globalWrap
			.replace(/{{dependencies}}/g, this.dependenciesSource)
			.replace(/{{cache}}/g, this.cache);
};

module.exports = Script;