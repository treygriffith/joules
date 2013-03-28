// invoked as node dev-build `location`
// 
var location = process.argv[2],
	path = require('path'),
	write = require('../build/development'),
	output_filename = 'joules.js';


function writeBrowser(to) {
	fs.writeFile(to, write, 'utf8', function(err) {
		if(err) {
			throw err;
		}
		console.log(to+' written');
	});
}

fs.exists(path.resolve(process.cwd(), location), function(exists) {
	if(exists) {
		fs.stat(path.resolve(process.cwd(), location), function(err, stats) {
			if(err) throw err;
			var writeTo;

			if(stats.isDirectory()) {
				writeBrowser(path.resolve(process.cwd(), location, output_filename));
				return;
			}

			writeBrowser(path.resolve(process.cwd(), utils.getParentDir(location), output_filename));
		});

		return;
	}

	writeBrowser(path.resolve(process.cwd(), utils.getParentDir(location), output_filename));
});