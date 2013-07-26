var fs = require('fs'),
	path = require('path'),
	utils = require(__dirname + '/../../utils'),
	loadModule = require(__dirname + '/../common/loadModule'),
	ready = fs.readFileSync(__dirname + '/ready.js', 'utf8');

// Build a production-ready javascript file
exports.build = function(target, callback) {
	loadModule(path.resolve('.', target), target, function(err, module) {
		if(err) {
			callback(err);
			return;
		}

		callback(null, ready + module.write(null, true) + module.invoke());
	});
};

// Build a directory hinting file about the directory structure to reduce http requests
exports.hint = function(dir, callback, filter) {
	var w = {};
	callback = callback || function(){};
	filter = filter || function() {
		return true;
	};

	function buildHints() {
		getDirStructure(dir, dir, function(err, struct) {
			if(err) {
				callback(err);
				return;
			}

			fs.writeFile(path.resolve(dir, "__hints.json"), JSON.stringify(struct), "utf8", callback);
			struct.directories.forEach(function(directory) {
				directory = directory.slice(1); //remove the leading slash

				if(w[directory] && w[directory].close) {
					w[directory].close();
				}

				if(filter(directory)) {
					w[directory] = fs.watch(path.resolve(dir, directory), watch);
				}
			});
		});
	}

	function watch(evt, filename) {
		if(filename !== "__hints.json") {
			buildHints();
		}
	}

	buildHints();
};

// recursively search a directory to build it's structure
// Structure is of the format
// {
//		"somefile.js" : "file",
//		"somedir" : {
//			"otherfile.js" : "file"
//		}
// }

function getDirStructure(dir, root, callback) {
	// skip hidden files
	if(dir.slice(dir.lastIndexOf('/') + 1)[0] === '.' && dir.slice(dir.lastIndexOf('/') + 1)[1] !== '.' && dir.slice(dir.lastIndexOf('/') + 1) !== '.') {
		callback(null, {
			files: [],
			directories: []
		});
		return;
	}

	fs.readdir(dir, function(err, files) {
		var hints = {
			files: [],
			directories: []
		};

		if(err) {
			callback(err);
			return;
		}

		if(files && files.length) {

			utils.forEachAsync(files, function(file, cb) {

				fs.stat(path.resolve(dir, file), function(err, stats) {
					if(err) {
						cb(err);
						return;
					}
					var resolved = path.resolve(dir, file);
					resolved = resolved.slice(path.resolve(root).length);

					if(stats.isDirectory()) {
						hints.directories.push(resolved);
						getDirStructure(path.resolve(dir, file), root, function(err, sub_hints) {
							if(err) {
								cb(err);
								return;
							}

							hints.files = hints.files.concat(sub_hints.files);
							hints.directories = hints.directories.concat(sub_hints.directories);
							cb(null, sub_hints);
						});
					} else {
						hints.files.push(resolved);
						cb(null, file);
					}
				});

			}, function(err, arr) {
				if(err) {
					callback(err);
					return;
				}
				callback(null, hints);
			});

		} else {
			callback(null, hints);
		}
	});
}
