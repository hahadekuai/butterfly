describe('weave', function() {
		
	it('immediately anonymous module', function() {
		var flag = false;
		define(function() {
			flag = true;	
		});
		expect(flag, true);
	});

	it('no conflict', function() {
		expect(window.define).toBeDefined();
		butterfly.noConflict();
		expect(window.define).toBeUndefined();

		window.define = butterfly.define;
		expect(window.define).toBeDefined();
		var ori = butterfly,
			other = butterfly.noConflict(true);

		expect(ori).toBe(other);
		expect(window.define).toBeUndefined();
		expect(window.butterfly).toBeUndefined();

		window.butterfly = other;
	});

	it('global method', function() {
		var config = butterfly.config('butterfly');
		expect(butterfly.define).toBe(config.define);
		expect(butterfly.require).toBe(config.require);
		expect(butterfly.isDefine).toBe(config.isDefine);
	});

	it('export loader module', function() {
		var util = loader.require('util'),
			names = ['loader', 'loader/util', 'loader/log', 'loader/event', 'loader/loaderEvent', 'loader/config'],
			config = butterfly.config('butterfly');

		config.require(names, function() {
			var modules = arguments;
			util.each(names, function(index, name) {
				expect(modules[index]).toBeDefined();
			});
		});
	});

});
