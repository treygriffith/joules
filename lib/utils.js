var path = require('path');

exports.replaceLineBreaks = function(text) {
	return text.replace(/\n/g, '\\n" +\n"');
};

exports.getParentDir = function(file) {
	var paths = file.split(path.sep);
	paths.pop();
	return path.resolve('./', paths.join(path.sep));
};

exports.forEachAsync = function(arr, fn, callback, thisArg) {
	var self = this, count = 0, returns = [], stopLoop = false;
	var done = function(err, result) {
		stopLoop = true;
		callback(err, result);
	};
	arr.forEach(function(each, index, arr) {
		if(!stopLoop) {
			var cb = function(stop, result) {
				if(stop) {
					done(stop);
				}
				if(result !== null && result !== undefined) {
					returns[index] = result;
				}
				if(arr.length == ++count) {
					if(!returns.length) { //callback with no arguments if no arguments were stored during the loop
						done();
					} else {
						done(null, returns);
					}
				}
			};
			fn.call(this, each, cb, index, arr);
		}
	}, thisArg);
};


