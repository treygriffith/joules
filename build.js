var fs = require('fs'),
	path = require('path'),
	utils = require('./utils'),
	Script = require('./script'),
	manifest_filename = "index.json",
	output_filename = "bundle.js",
	location = process.argv[2],
	loadModule = require('./loadModule'),
	ready = fs.readFileSync('./build-ready.js', 'utf8');

function writeModule(to, module) {
	fs.writeFile(to, ready + module.write(null, true) + module.invoke(), 'utf8', function(err) {
		if(err) throw err;

		console.log("done writing to "+to);
	});
}

loadModule('./' + location, './', function(err, module) {
	if(err) throw err;

	fs.exists('./' + location, function(exists) {
		if(exists) {
			fs.stat('./' + location, function(err, stats) {
				if(err) throw err;
				var writeTo;

				if(stats.isDirectory()) {
					writeModule(path.resolve(location, output_filename), module);
					return;
				}

				writeModule(path.resolve('./', utils.getParentDir(location), output_filename), module);
			});

			return;
		}

		writeModule(path.resolve('./', utils.getParentDir(location), output_filename), module);
	});

});

