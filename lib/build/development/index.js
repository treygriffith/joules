var fs = require('fs'),
	utils = require(__dirname + '/../../utils');

var cacheWrap = fs.readFileSync(__dirname + '/../common/wrappers/cache-wrap.js', 'utf8'),
	dependenciesWrap = fs.readFileSync(__dirname + '/../common/wrappers/dependencies-wrap.js', 'utf8'),
	globalWrap = fs.readFileSync(__dirname + '/../common/wrappers/global-wrap.js', 'utf8'),
	rootWrap = fs.readFileSync(__dirname + '/../common/wrappers/root-wrap.js', 'utf8'),

	scriptJs = fs.readFileSync(__dirname + '/../common/script.js', 'utf8'),
	loadModuleJs = fs.readFileSync(__dirname + '/../common/loadModule.js', 'utf8'),

	invoke = fs.readFileSync(__dirname + '/wrappers/invoke.js', 'utf8'),
	readyJs = fs.readFileSync(__dirname + '/ready.js', 'utf8');


var cacheWrapWrite = 'var cacheWrap = "' + utils.replaceLineBreaks(cacheWrap.replace(/\"/g, '\\"')) + '";\n',
	dependenciesWrapWrite = 'var dependenciesWrap = "' + utils.replaceLineBreaks(dependenciesWrap.replace(/\"/g, '\\"')) + '";\n',
	globalWrapWrite = 'var globalWrap = "' + utils.replaceLineBreaks(globalWrap.replace(/\"/g, '\\"')) + '";\n',
	rootWrapWrite = 'var rootWrap = "' + utils.replaceLineBreaks(rootWrap.replace(/\"/g, '\\"')) + '";\n',
	invokeWrite = 'var invoke = "' + utils.replaceLineBreaks(invoke.replace(/\"/g, '\\"')) + '";\n',
	scriptJsWrite = 'var browserBuild = true;\n' + scriptJs;

module.exports = '(function() {' +
					cacheWrapWrite +
					dependenciesWrapWrite +
					globalWrapWrite +
					rootWrapWrite +
					invokeWrite +
					scriptJsWrite +
					loadModuleJs +
					readyJs +
				'})();';



