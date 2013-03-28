#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	utils = require('../lib/utils'),
	joules = require('../'),
	argv = require('optimist')
			.usage('Build a deployment bundle of CommonJS modules\nUsage: $0 [module] --out [filename]')
			.alias('o', 'out')
			.describe('o', 'Target output filename')
			.argv;

var location = argv._[0];


function writeScript(to, script) {
	fs.writeFile(to, script, 'utf8', function(err) {
		if(err) throw err;

		console.log("done writing to "+to);
	});
}

function output_name(dir, target) {
	if(argv.o) {
		if(argv.o[0] === '.' || argv.o[1] === '/') {
			return argv.o;
		}
		return path.resolve(process.cwd(), argv.o);
	}

	var base = target.split('/').pop();
	if(base.slice(-3) === '.js') {
		base = base.slice(0, -3);
	}

	return path.resolve(process.cwd(), dir, base + '.joules.js');
}

joules.build(path.resolve(process.cwd(), location), function(err, script) {
	if(err) throw err;

	if(!script) {
		throw new Error("No module loaded.");
	}

	fs.exists(path.resolve(process.cwd(), location), function(exists) {
		if(exists) {
			fs.stat(path.resolve(process.cwd(), location), function(err, stats) {
				if(err) throw err;

				if(stats.isDirectory()) {
					writeScript(output_name(location, location), script);
					return;
				}

				writeScript(output_name(utils.getParentDir(location), location), script);
			});

			return;
		}

		writeScript(output_name(utils.getParentDir(location), location), script);
	});
});