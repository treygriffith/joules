exports.replaceLineBreaks = function(text) {
	return text.replace(/\n/g, '\\n" +\n"');
};