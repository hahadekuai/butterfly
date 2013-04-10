define('spec.lang.Aspect', ['Class', 'lang.Aspect'], function(Class, Aspect) {

describe(this.id, function() {

it('before', function() {
	var A = {
		sum: function() {
			var sum = 0; 
			for (var i = 0, c = arguments.length; i < c; i++) {
				sum += arguments[i];
			}
			return sum;
		}
	};

	expect(A.sum(1, 2, 3, 4)).toBe(10);

	Aspect.before(A, 'sum', function(o) {
		expect(o.target).toBe(A);
		expect(o.name).toBe('sum');
		expect(o.args).toEqual([1, 2, 3, 4]);

		return [2, 3, 4, 5];
	});

	expect(A.sum(1, 2, 3, 4)).toBe(14);
		
});
//~

it('after', function() {
	var A = {
		hello: function(name) {
			return 'hello ' + name;
		}
	};

	expect(A.hello('lilei')).toBe('hello lilei');
	
	Aspect.after(A, 'hello', function(o) {
		return o.result + ' bye bye';
	});

	expect(A.hello('lilei')).toBe('hello lilei bye bye');
});


it('around', function() {
	var A = {
		calc: function(a, b, c) {
			return a + b + c;
		}
	};

	expect(A.calc(1, 2, 3)).toBe(6);

	Aspect.around(A, 'calc', function(o) {
		var args = o.args,
			a = args[0] * 100,
			b = args[1] * 100,
			c = args[2] * 100;
		return o.method.call(o.target, a, b, c);
	});

	expect(A.calc(1, 2, 3)).toBe(600);
});

it('detach & attach', function() {
	var A = {
		hello: function(name) {
			return 'hello ' + name;
		}
	};

	var hello = A.hello;

	expect(A.hello('lilei')).toBe('hello lilei');
	expect(A.hello).toBe(hello);

	var aspect = new Aspect();
	aspect.around(A, 'hello', function(o) {
		return 'say ' + o.args[0];
	});
	expect(A.hello).not.toBe(hello);

	expect(A.hello('lilei')).toBe('say lilei');

	aspect.detach();
	expect(A.hello('lilei')).toBe('hello lilei');
	expect(A.hello).toBe(hello);

	aspect.attach();
	expect(A.hello('xiaoming')).toBe('say xiaoming');

});


it('pointcut - array', function() {
	var A = {
		a: function() {
		},
		b: function() {
		},
		c: function() {
		}
	};

	Aspect.around(A, ['a', 'b', 'c'], function(o) {
		return o.name;	
	});

	expect(A.a()).toBe('a');
	expect(A.b()).toBe('b');
	expect(A.c()).toBe('c');
});


it('pointcut - pattern', function() {
	var A = {
		a1: function() {
			return 'a1';
		},
		a2: function() {
			return 'a2';
		},
		a3: function() {
			return 'a3';
		},
		b1: function() {
			return 'b1';
		},
		b2: function() {
			return 'b2';
		}
	};

	Aspect.after(A, /^a/, function(o) {
		return 'hi ' + o.result;
	});

	expect(A.a1()).toBe('hi a1');
	expect(A.a2()).toBe('hi a2');
	expect(A.a3()).toBe('hi a3');

	expect(A.b1()).toBe('b1');
	expect(A.b2()).toBe('b2');

});



});
//~ describe

});
