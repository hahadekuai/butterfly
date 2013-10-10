/**
 * adapter for lofty
 */
var butterfly = (function() {


var exports = window.butterfly;
if (exports && exports.adapter) {
	return exports;
}


var each = function(iter, fn) {
	for (var i = 0, c = iter.length; i < c; i++) {
		fn(i, iter[i]);
	}
};


lofty('butterfly-lofty-adapter', ['module', 'use'], function(module, use) {
	var require = module.require;

	module.require = function(depends, factory) {
		if (typeof depends === 'string') {
			depends = [depends];
		}

		var now = 0,
			mods = [];
		var check = function() {
			if (now === depends.length) {
				// ��lofty�ڲ�,require�ڶ����������ܲ���factory
				// ��ô������~~~
				factory && factory.apply && factory.apply(null, mods);
			}
		};

		each(depends, function(index, id) {
			if (module.hasDefine(id)) {
				mods[index] = require(id);
				now++;
				check();
			} else {
				use.fetch([id], function() {
					mods[index] = require(id);
					now++;
					check();
				});
			}
		});
		
		return mods[0];
	};


	exports = {
		adapter: true,

		define: define,

		isDefine: function(id) {
			return !!module.hasDefine(id);
		},

		require: module.require,

		on: function(type, fn) {
			if (type !== 'define') {
				throw 'not implement exception';
			}

			lofty.on('define', function(mod) {
				// lofty�ڲ�save��define֮��, ������Ҫ��define�¼��о���ȡ��ģ��
				module.save(mod);

				fn({
					id: mod.id,
					depends: mod.deps,
					factory: mod.factory
				})
			});
		}
	};


	exports.config = function(config) {
		return exports;
	};
	
});


return exports;


})();
