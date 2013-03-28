var fs = require('fs'),
	utils = require('./utils'),
	path = require('path'),
	output_filename = 'browser.js',

	location = process.argv[2],

	cacheWrap = fs.readFileSync('./wrappers/cache-wrap.js', 'utf8'),
	dependenciesWrap = fs.readFileSync('./wrappers/dependencies-wrap.js', 'utf8'),
	globalWrap = fs.readFileSync('./wrappers/global-wrap.js', 'utf8'),
	rootWrap = fs.readFileSync('./wrappers/root-wrap.js', 'utf8'),
	invoke = fs.readFileSync('./wrappers/browser-invoke.js', 'utf8'),
	scriptJs = fs.readFileSync('./script.js', 'utf8'),
	loadModuleJs = fs.readFileSync('./loadModule.js', 'utf8'),
	readyJs = fs.readFileSync('./browser-ready.js', 'utf8');


var cacheWrapWrite = 'var cacheWrap = "' + utils.replaceLineBreaks(cacheWrap) + '";\n',
	dependenciesWrapWrite = 'var dependenciesWrap = "' + utils.replaceLineBreaks(dependenciesWrap) + '";\n',
	globalWrapWrite = 'var globalWrap = "' + utils.replaceLineBreaks(globalWrap) + '";\n',
	rootWrapWrite = 'var rootWrap = "' + utils.replaceLineBreaks(rootWrap) + '";\n',
	invokeWrite = 'var invoke = "' + utils.replaceLineBreaks(invoke) + '";\n',
	scriptJsWrite = 'var browserBuild = true;\n' + scriptJs,
	write = '(function() {' + readyJs + cacheWrapWrite + dependenciesWrapWrite + globalWrapWrite + rootWrapWrite + invokeWrite + scriptJsWrite + loadModuleJs + '})();';

function writeBrowser(to) {
	fs.writeFile(to, write, 'utf8', function(err) {
		if(err) {
			throw err;
		}
		console.log(to+' written');
	});
}

fs.exists('./' + location, function(exists) {
	if(exists) {
		fs.stat('./' + location, function(err, stats) {
			if(err) throw err;
			var writeTo;

			if(stats.isDirectory()) {
				writeBrowser(path.resolve(location, output_filename));
				return;
			}

			writeBrowser(path.resolve('./', utils.getParentDir(location), output_filename));
		});

		return;
	}

	writeBrowser(path.resolve('./', utils.getParentDir(location), output_filename));
});


