if(typeof browserBuild === 'undefined') {
	var fs = require('fs'),
		cacheWrap = fs.readFileSync(__dirname + '/wrappers/cache-wrap.js', 'utf8'),
		dependenciesWrap = fs.readFileSync(__dirname + '/wrappers/dependencies-wrap.js', 'utf8'),
		globalWrap = fs.readFileSync(__dirname + '/wrappers/global-wrap.js', 'utf8'),
		rootWrap = fs.readFileSync(__dirname + '/wrappers/root-wrap.js', 'utf8'),
		invoke = fs.readFileSync(__dirname + '/../deployment/wrappers/invoke.js', 'utf8');
}

// cache of written dependencies
var writeCache = {};


// Need a way to make all dependencies of a top level script available on window.require;
// Top level script therefore does not have a source to be wrapped

function Script(parent, dependencies, id, name, source) {
	this.parent = parent;
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
	this.dependenciesFound = this.dependenciesFound || [this.id];
	this.dependencies.forEach(function(dependency) {
		if(!~script.dependenciesFound.indexOf(dependency.id)) {
			script.dependenciesFound.push(dependency.id);
			script.dependenciesSource += dependency.write(cache || script.cache);
		} else {
			//console.log("writing dependency root wrap", dependency.id);
			//script.dependenciesSource += dependency.rootWrap();
		}
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
	return  this.wrap();
};

Script.prototype.invoke = function() {
	return invoke
			.replace(/{{name}}/g, this.name);
};

// For some reason, in the foam-client script all the dollar signs are being overwritten with the bottom portion of the cacheWrap
// actually, sometimes it's the top portion...

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