var path = require('path');

exports.replaceLineBreaks = function(text) {
	return text.replace(/\n/g, '\\n" +\n"');
};

exports.getParentDir = function(file) {
	var paths = file.split(path.sep);
	paths.pop();
	return path.resolve('./', paths.join(path.sep));
}