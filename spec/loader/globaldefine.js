describe('globaldefine', function() {
	
	var module = loader.require('module'),
		config = loader.require('config'),
		define = loader.require('globaldefine'),
		cache = module.cache;

	window.globaldefine = loader.require('globaldefine');

	it('sync define', function() {
		config({
			id: 'site'
		});

		config({
			id: 'offer'
		});

		config.push('site');

		define('mod1', 'mod1');
		define('mod2', 'mod2');

		config.push('offer');
		define('mod1', 'mod1');
		define('mod2', 'mod2');
		define('mod3', 'mod3');

		config.pop();

		define('mod3', 'mod3');

		expect(cache.site.modules.mod1).toBeDefined();
		expect(cache.site.modules.mod2).toBeDefined();
		expect(cache.site.modules.mod3).toBeDefined();

		expect(cache.offer.modules.mod1).toBeDefined();
		expect(cache.offer.modules.mod2).toBeDefined();
		expect(cache.offer.modules.mod3).toBeDefined();

		config.pop();
	});

	it('async define', function() {
		var site = config({
			id: 'site',
			path: {
				mod9: './fixture/loader/site-mod9.js?delay=0.2',
				mod10: './fixture/loader/site-mod10.js?delay=0.5',
				mod11: './fixture/loader/site-mod11.js?delay=0.8'
			}
		});

		var offer = config({
			id: 'offer',
			path: {
				mod9: './fixture/loader/offer-mod9.js?delay=0.3',
				mod10: './fixture/loader/offer-mod10.js?delay=0.6',
				mod11: './fixture/loader/offer-mod11.js?delay=0.9'
			}
		});

		config.push('offer');
		
		var siteSuccess = false,
			offerSuccess = false;
		site.require(['mod9', 'mod10', 'mod11'], function(mod9, mod10, mod11) {
			siteSuccess = true;	
			expect(mod9).toBe('site-mod9');
			expect(mod10).toBe('site-mod10');
			expect(mod11).toBe('site-mod11');
		});

		offer.require(['mod9', 'mod10', 'mod11'], function(mod9, mod10, mod11) {
			offerSuccess = true;	
			expect(mod9).toBe('offer-mod9');
			expect(mod10).toBe('offer-mod10');
			expect(mod11).toBe('offer-mod11');
		});

		waitsFor(function() {
			return siteSuccess && offerSuccess;	
		});
	});
	
});
