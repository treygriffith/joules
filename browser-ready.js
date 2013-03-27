// load the data-main script

var loadMain = function(main) {
	if(main) {
		if(typeof loadModule !== 'function') {
			window.setTimeout(function() {
				loadMain(main);
			}, 10);
			return;
		}
		loadModule('./', './'+main, function(err, module) {
			if(err) throw err;

			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.text = '(function() { var require = {ready:window.require.ready, fire:window.require.fire};\n' + module.write(null, true) + module.invoke() + '})();';
			window.document.body.appendChild(script);		
		});
	}	
};

var scripts = window.document.getElementsByTagName("script");
var script = scripts[scripts.length - 1];
loadMain(script.getAttribute('data-main'));


window.require = function() {
	throw new Error("Can't call require outside of require.ready");
};

window.require.fire = function(evt) {
};

window.require.ready = function(fn) {

	var whole = fn.toString();
	var body = whole.substring(whole.indexOf('{')+1, whole.lastIndexOf('}'));

	loadModule(body, Math.round(Math.random()*10000).toString(), function(err, module) {
		if(err) throw err;

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.text = '(function() { var require = {ready:window.require.ready, fire:window.require.fire};\n' + module.write(null, true) + module.invoke() + '})();';
		window.document.body.appendChild(script);
	}, true);
};