define('spec.lang.Loader', ['require'], function(require) {

describe(this.id, function() {


it('正确动态加载模块', function() {
	require([
			'spec.fixture.lang.loader.SampleModule',
			'spec.fixture.lang.loader.A',
			'spec.fixture.lang.loader.B'
		], function(m1, m2, m3) {
			expect(m1).toBe('SampleModule');
			expect(m2).toBe('A');
			expect(m3).toBe('B');
	});
});
	

});

});
