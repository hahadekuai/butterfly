describe('config', function() {

	var cache = loader.require('module').cache,
		Config = loader.require('config');

	it('config', function() {
		expect(cache.newloader).toBeUndefined();
		Config.config({ id: 'newloader' });
		expect(cache.newloader).toBeDefined();

		expect(Config.get('newloader')).toBe(cache.newloader.facade);
	});

	
});
