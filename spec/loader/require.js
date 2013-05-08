describe('require', function() {

	var loaderEvent = loader.require('loaderEvent'),
		define = loader.require('define'),
		require = loader.require('require'),
		config = {
			id: 'testrequire',
			modules: {}
		};

	it('require sync module', function() {
		define(config, 'test.a', 'test.a');
		define(config, 'test.b', 'test.b');
		define(config, 'test.c', ['test.a', 'test.b'], function(a, b) {
			return a + ',' + b;
		});

		var called = false;
		var o = require(config, ['test.c', 'test.b'], function(c, b) {
			called = true;
			expect(c).toBe('test.a,test.b');
			expect(b).toBe('test.b');
		});

		expect(called).toBeTruthy();
		expect(o).toBe('test.a,test.b');
	});

});
