var fs = require('fs'),
	loadModule = require('../common/loadModule'),
	ready = fs.readFileSync('./ready.js', 'utf8');

exports.build = function(target, callback) {
	loadModule(target, target, function(err, module) {
		if(err) {
			callback(err);
			return;
		}

		callback(null, ready + module.write(null, true) + module.invoke());
	});
};


