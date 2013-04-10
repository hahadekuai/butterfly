describe('weave', function() {
		
	it('immediately anonymous module', function() {
		var flag = false;
		define(function() {
			flag = true;	
		});
		expect(flag, true);
	});

	it('test no conflict', function() {
		expect(window.define).toBeDefined();
		butterfly.noConflict();
		expect(window.define).toBeUndefined();

		window.define = butterfly.define;
		expect(window.define).toBeDefined();
		var other = butterfly.noConflict(true);
		expect(window.define).toBeUndefined();
		expect(window.butterfly).toBeUndefined();

		window.butterfly = other;
	});

	it('test butterfly global method', function() {
		var config = butterfly.config('butterfly');
		expect(butterfly.define).toBe(config.define);
		expect(butterfly.require).toBe(config.require);
		expect(butterfly.isDefine).toBe(config.isDefine);
	});

});
