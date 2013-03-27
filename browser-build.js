var fs = require('fs'),
	utils = require('./utils'),
	path = require('path'),

	location = process.argv[2],

	cacheWrap = fs.readFileSync('./wrappers/cache-wrap.js', 'utf8'),
	dependenciesWrap = fs.readFileSync('./wrappers/dependencies-wrap.js', 'utf8'),
	globalWrap = fs.readFileSync('./wrappers/global-wrap.js', 'utf8'),
	scriptJs = fs.readFileSync('./script.js', 'utf8'),
	loadModuleJs = fs.readFileSync('./loadModule.js', 'utf8'),
	appendModuleJs = fs.readFileSync('./appendModule.js', 'utf8'),
	readyJs = fs.readFileSync('./ready.js', 'utf8');


var cacheWrapWrite = 'var cacheWrap = "' + utils.replaceLineBreaks(cacheWrap) + '";\n',
	dependenciesWrapWrite = 'var dependenciesWrap = "' + utils.replaceLineBreaks(dependenciesWrap) + '";\n',
	globalWrapWrite = 'var globalWrap = "' + utils.replaceLineBreaks(globalWrap) + '";\n',
	scriptJsWrite = 'var browserBuild = true;\n' + scriptJs,
	write = '(function() {' + readyJs + cacheWrapWrite + dependenciesWrapWrite + globalWrapWrite + scriptJsWrite + loadModuleJs + appendModuleJs + '})();';

fs.writeFile(path.resolve(location, 'browser.js'), write, 'utf8', function(err) {
	if(err) {
		throw err;
	}
	console.log('browser.js written');
});


