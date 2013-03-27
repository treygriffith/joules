var fs = require('fs'),
	path = require('path'),
	Script = require('./script');
	manifest_filename = "index.json",
	output_filename = "bundle.js",
	location = process.argv[2];

fs.readFile(path.resolve(location, manifest_filename), function(err, raw) {
	var manifest,
		dependencies = [],
		dependencies_count = 0;

	if(err) throw err;

	try {
		manifest = JSON.parse(raw);
	} catch(e) {
		throw e;
	}

	if(!manifest.dependencies) {
		throw new Error("No dependencies defined");
	}

	for(var p in manifest.dependencies) {
		dependencies_count++;
	}


	for(var dep_name in manifest.dependencies) {
		var dep_location = manifest.dependencies[dep_name],
			dep_id = path.resolve(location, dep_location);

		fs.readFile(dep_id, 'utf8', function(err, contents) {
			if(err) throw err;

			dependencies.push(new Script([], dep_id, dep_name, contents));

			if(dependencies_count === dependencies.length) {
				var script = new Script(dependencies);

				fs.writeFile(path.resolve(location, output_filename), script.write(), 'utf8', function(err) {
					if(err) throw err;

					console.log("done writing to "+output_filename);
				});
			}
		});

	}

});