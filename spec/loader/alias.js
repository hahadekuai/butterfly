describe('alias', function() {

var alias = loader.require('alias');
	
it('alias', function() {
	var config = {
		alias: {
			'a.Test': 'b.Test',
			'b.Hello': 'b.HelloWorld'
		}
	};

	alias.push({
		'Context': 'context.Context'	
	});

	expect(alias.get(config, 'a.Some')).toBe('a.Some');
	expect(alias.get(config, 'a.Test')).toBe('b.Test');
	expect(alias.get(config, 'b.Hello')).toBe('b.HelloWorld');

	expect(alias.get(config, 'Context')).toBe('context.Context');
	
});
		
});
