var fs = require('fs'),
	utils = require('../../utils');

var cacheWrap = fs.readFileSync('../common/wrappers/cache-wrap.js', 'utf8'),
	dependenciesWrap = fs.readFileSync('../common/wrappers/dependencies-wrap.js', 'utf8'),
	globalWrap = fs.readFileSync('../common/wrappers/global-wrap.js', 'utf8'),
	rootWrap = fs.readFileSync('../common/wrappers/root-wrap.js', 'utf8'),

	scriptJs = fs.readFileSync('../common/script.js', 'utf8'),
	loadModuleJs = fs.readFileSync('../common/loadModule.js', 'utf8'),

	invoke = fs.readFileSync('./wrappers/invoke.js', 'utf8'),
	readyJs = fs.readFileSync('./ready.js', 'utf8');


var cacheWrapWrite = 'var cacheWrap = "' + utils.replaceLineBreaks(cacheWrap) + '";\n',
	dependenciesWrapWrite = 'var dependenciesWrap = "' + utils.replaceLineBreaks(dependenciesWrap) + '";\n',
	globalWrapWrite = 'var globalWrap = "' + utils.replaceLineBreaks(globalWrap) + '";\n',
	rootWrapWrite = 'var rootWrap = "' + utils.replaceLineBreaks(rootWrap) + '";\n',
	invokeWrite = 'var invoke = "' + utils.replaceLineBreaks(invoke) + '";\n',
	scriptJsWrite = 'var browserBuild = true;\n' + scriptJs;

module.exports = '(function() {' +
					readyJs +
					cacheWrapWrite +
					dependenciesWrapWrite +
					globalWrapWrite +
					rootWrapWrite +
					invokeWrite +
					scriptJsWrite +
					loadModuleJs +
				'})();';



