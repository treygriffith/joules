'{{id}}' : function(cache, dependencies) {
	return function(parent) {
		var found = [];
		var walkForId = function(module, stopId) {
			if(stopId && module.id === stopId) {
				return module;
			} else if(!stopId) {
				stopId = module.id;
			}
			if(~found.indexOf(module.id)) {
				return false;
			}
			found.push(module.id);
			for(var i=0;i<module.children.length;i++) {
				var ret = walkForId(module.children[i], stopId);
				if(ret) {
					return ret;
				}
			}
			return false;
		};

		if(!cache['{{id}}']) {

			cache['{{id}}'] = {
				require: function(name, assignment) {
					if(typeof dependencies[name] !== 'function') {
						throw new Error('Module Not Found');
					}

					// make sure we're not infinitely looping
					if(walkForId(this)) {
						return cache['{{id}}'].exports;
					}

					var childModule = dependencies[name](this);
					this.children.push(childModule);
					return childModule.exports;
				},
				exports: {},
				id: '{{id}}',
				filename: '{{filename}}',
				loaded: false,
				children: [],
				parent: parent
			};

			cache['{{id}}'] = (function(module) {

				var dependencies = undefined, cache = undefined, parent = undefined;


				(function(module, require, exports) {

					{{source}}

				})(module, function() {

					return module.require.apply(module, Array.prototype.slice.call(arguments));

				}, module.exports);

				module.loaded = true;
				return module;

			})(cache['{{id}}']);
		}
		return cache['{{id}}'];
	};
}