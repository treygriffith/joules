var fs = require('fs-browser'),
	markdown = require('markdown-js').markdown;

function renderMarkdown(name, callback) {
	if(!~name.indexOf('.')) {
		name = name +  '.md';
	}
	if(name[0] !== '/') {
		name = '/templates/'+name;
	}
	fs.readFile(name, 'utf8', function(err, contents) {
		if(err) {
			callback(err);
			return;
		}

		renderMarkdown.raw(contents, callback);
	});
}

renderMarkdown.raw = function(raw, callback) {
	// remove github-flavored code blocks
	var contents = raw.replace(/```[\S]*/g, '');


	callback(null, "<div class='markdown'>" + markdown(contents) + "</div>");
};

module.exports = renderMarkdown;