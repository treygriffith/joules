window.require = function() {};

window.require._events = {};

window.require.fire = function(evt) {
	if(this._events[evt] && this._events[evt].length) {
		this._events[evt].forEach(function(fn) {
			fn.call(window);
		});
	}
	if(evt === 'ready') {
		this.ready = function(fn) {
			fn.call(window);
		};
	}
};

window.require.ready = function(fn) {
	this._events.ready = this._events.ready || [];
	this._events.ready.push(fn);
};