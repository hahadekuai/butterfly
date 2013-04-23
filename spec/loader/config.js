describe('config', function() {

	var cache = loader.require('module').cache,
		config = loader.require('config');

	it('config a new loader', function() {
		expect(cache.newloader).toBeUndefined();
		config({ id: 'newloader' });
		expect(cache.newloader).toBeDefined();
	});
	
});
