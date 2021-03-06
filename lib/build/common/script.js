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

// filter out single dollar signs from replacement text, and replace them with double dollar signs
// this will be rendered as a single due to the way that String#replace works
function dollarFilter(str) {
	return str.split('$').join('$$');
}


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

	this.dependenciesSource = this.dependenciesSource || "";
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
			.replace(/{{name}}/g, dollarFilter(this.name));
};

Script.prototype.addToCache = function(cache) {
	var wrapped;
	cache = cache || this.cache;

	wrapped = cacheWrap
				.replace(/{{id}}/g, dollarFilter(this.id))
				.replace(/{{source}}/g, dollarFilter(this.source));

	if(!!~cache.indexOf(wrapped)) {
		// don't add the same script twice
		return;
	}

	cache.push(wrapped);

	return wrapped;
};

Script.prototype.wrap = function() {
	return dependenciesWrap
			.replace(/{{id}}/g, dollarFilter(this.id))
			.replace(/{{name}}/g, dollarFilter(this.name))
			.replace(/{{dependencies}}/g, dollarFilter(this.dependenciesSource));
};

Script.prototype.rootWrap = function() {
	return rootWrap
			.replace(/{{id}}/g, dollarFilter(this.id))
			.replace(/{{name}}/g, dollarFilter(this.name));
};

Script.prototype.globalWrap = function() {
	return globalWrap
			.replace(/{{dependencies}}/g, dollarFilter(this.dependenciesSource))
			.replace(/{{cache}}/g, dollarFilter(this.cache.join(',')));
};

Script.prototype.clone = function() {
	return new Script(this.parent, this.dependencies, this.id, this.name, this.source);
};

if(typeof browserBuild === 'undefined') {
	module.exports = Script;
}