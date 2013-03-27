var fs = require('fs'),
	path = require('path'),
	Script = require('./script'),
	manifest_filename = "index.json",
	output_filename = "bundle.js",
	location = process.argv[2],
	loadModule = require('./loadModule'),
	ready = fs.readFileSync('./build-ready.js', 'utf8');

loadModule('./' + location, null, function(err, module) {
	if(err) throw err;

	fs.writeFile(path.resolve(location, output_filename), ready + module.write(null, true) + module.invoke(), 'utf8', function(err) {
		if(err) throw err;

		console.log("done writing to "+output_filename);
	});	
});

