//shim for path functions
exports.resolve = function(from, to) {
	var resolvedPath = '',
		resolvedAbsolute = false;

	for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
		var path = (i >= 0) ? arguments[i] : process.cwd();

		// Skip empty and invalid entries
		if (typeof path !== 'string') {
			throw new TypeError('Arguments to path.resolve must be strings');
		} else if (!path) {
			continue;
		}

		resolvedPath = path + '/' + resolvedPath;
		resolvedAbsolute = path.charAt(0) === '/';
	}

	// At this point the path should be resolved to a full absolute path, but
	// handle relative paths to be safe (might happen when process.cwd() fails)

	// Normalize the path
	resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
		return !!p;
	}), !resolvedAbsolute).join('/');

	return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '';
};

exports.join = function() {
	var paths = Array.prototype.slice.call(arguments, 0);
	return normalize(paths.filter(function(p, index) {
	if (typeof p !== 'string') {
	throw new TypeError('Arguments to path.join must be strings');
	}
	return p;
	}).join('/'));
};

sep = '/';

normalize = function(path) {
	var isAbsolute = path.charAt(0) === '/',
		trailingSlash = path.substr(-1) === '/';

	// Normalize the path
	path = normalizeArray(path.split('/').filter(function(p) {
		return !!p;
	}), !isAbsolute).join('/');

	if (!path && !isAbsolute) {
		path = '.';
	}
	if (path && trailingSlash) {
		path += '/';
	}

	return (isAbsolute ? '/' : '') + path;
};

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
var normalizeArray = function(parts, allowAboveRoot) {
	// if the path tries to go above the root, `up` ends up > 0
	var up = 0;
	for (var i = parts.length - 1; i >= 0; i--) {
		var last = parts[i];
		if (last === '.') {
			parts.splice(i, 1);
		} else if (last === '..') {
			parts.splice(i, 1);
			up++;
		} else if (up) {
			parts.splice(i, 1);
			up--;
		}
	}

	// if the path is allowed to go above the root, restore leading ..s
	if (allowAboveRoot) {
		for (; up--; up) {
			parts.unshift('..');
		}
	}

	return parts;
};