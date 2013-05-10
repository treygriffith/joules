var fs = require('fs-browser'),
	hogan = require('hogan.js');

function render(name, context, callback) {
	if(!callback) {
		callback = context;
		context = {};
	}
	if(!~name.indexOf('.')) {
		name = name +  '.html';
	}
	fs.readFile('/templates/'+name, 'utf8', function(err, contents) {
		if(err) {
			callback(err);
			return;
		}

		var template = hogan.compile(contents);

		callback(null, template.render(context), template);
	});
}

module.exports = render;