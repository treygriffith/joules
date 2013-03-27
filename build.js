var fs = require('fs'),
	path = require('path'),
	Script = require('./script'),
	manifest_filename = "index.json",
	output_filename = "bundle.js",
	location = process.argv[2],
	loadModule = require('./loadModule'),
	ready = fs.readFileSync('./build-ready.js', 'utf8');

loadModule('./' + location, './', function(err, module) {
	if(err) throw err;

	fs.stat('./' + location, function(err, stats) {
		if(err) throw err;
		var writeTo;

		if(stats.isDirectory()) {
			writeTo = path.resolve(location, output_filename);
		} else {
			var locations = location.split(path.sep);
			locations.pop();
			writeTo = path.resolve('./', locations.join(path.sep), output_filename);
		}

		fs.writeFile(writeTo, ready + module.write(null, true) + module.invoke(), 'utf8', function(err) {
			if(err) throw err;

			console.log("done writing to "+writeTo);
		});	
	});
});

