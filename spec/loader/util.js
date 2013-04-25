describe('util', function() {
	
var util = loader.require('util');

it('util.isArray', function() {
	expect(util.isArray([])).toBe(true);
	expect(util.isArray('string')).toBe(false);
});

it('util.extend', function() {
	var a = { a: 1, b: 2 },
		b = { b: 5, c: 10 },
		c = util.extend(a, b);

	expect(c).toBe(a);
	expect(c).not.toBe(b);
	expect(c).toEqual({a:1, b:5, c:10});
});

it('util.error', function() {
	expect(function() {
		util.error('some error happen');
	}).toThrow();
});

it('util.proxy', function() {
	var add = function(a, b) {
		return a + b;
	};
	var add100 = util.proxy(add, 100);
	expect(add100(200)).toBe(300);
});

it('util.assert', function() {
	expect(function() {
		util.assert(true, 'must not be here');
	}).not.toThrow();

	expect(function() {
		util.assert(false, 'must not be here');
	}).toThrow();
});

});
