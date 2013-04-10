describe('resolve', function() {

	var resolve = loader.require('resolve');

	it('resolve', function() {
		var config = {
			root: 'http://www.demo.com/js/',
			path: {
				'vendor': 'vendor/js',
				'test': '/test/js'
			}
		};

		expect(resolve(config, 'ui.Tabs')).toBe('http://www.demo.com/js/ui/tabs.js');
		expect(resolve(config, 'vendor.Jasmine')).toBe('http://www.demo.com/js/vendor/js/jasmine.js');

		expect(resolve(config, 'test.ui.Tabs')).toBe('/test/js/ui/tabs.js');

		expect(resolve(config, 'a/b/c')).toBe('http://www.demo.com/js/a/b/c.js');
		expect(resolve(config, 'a/b/c.js')).toBe('http://www.demo.com/js/a/b/c.js');

		expect(resolve(config, '/abc.js')).toBe('/abc.js');
		expect(resolve(config, 'abc.js')).toBe('http://www.demo.com/js/abc.js');
		expect(resolve(config, 'http://demo.js')).toBe('http://demo.js');
	});

	it('resolve with config', function() {
		var config = {
			resolve: function(id) {
				return id;	
			}
		};

		expect(resolve(config, 'ui.Tabs')).toBe('ui.Tabs');
	});

	
});
