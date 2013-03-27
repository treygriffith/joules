window.require = function() {};

window.require._events = {};

window.require.fire = function(evt) {
	if(this._events[evt] && this._events[evt].length) {
		this._events[evt].forEach(function(fn) {
			fn.call(window);
		});
	}
};

window.require.ready = function(fn) {
	/*
	this._events.ready = this._events.ready || [];
	this._events.ready.push(fn);*/

	var whole = fn.toString();
	var body = whole.substring(whole.indexOf('{')+1, whole.lastIndexOf('}'));

	loadModule(body, Math.round(Math.random()*10000).toString(), function(err, module) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.text = module.write(null, true) + module.invoke();
		window.document.body.appendChild(script);
	}, true);
};