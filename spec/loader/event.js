describe('event', function() {

var Event = loader.require('event');

it('event', function() {
	var event = new Event('test');

	var list = [];
	event.on('click', function(data) {
		list.push(data);
	});

	var fn = function(data) {
		list.push(data * 2);
	};
	event.on('click', fn);

	event.trigger('click', 100);
	expect(list.length).toBe(2);
	expect(list[0]).toBe(100);
	expect(list[1]).toBe(200);

	event.off('click', fn);
	event.trigger('click', 500);
	expect(list.length).toBe(3);
	expect(list[2]).toBe(500);

	event.off('click');
	event.trigger('click', 100);
	expect(list.length).toBe(3);
});

it('trigger with mutiple param', function() {
	var event = new Event('test2'),
		called = false;

	event.on('click', function(a, b, c, d) {
		called = true;
		expect(a).toBe(1);	
		expect(b).toEqual([1]);	
		expect(c).toEqual({ a: 1 });	
		expect(d).toBe('d');	
	});

	event.trigger('click', 1, [1], { a: 1 }, 'd');
	expect(called).toBeTruthy();

});

it('with break', function() {
	var event = new Event('test3');
	var count = 0;
	event.on('click', function() {
		count++;	
		return false;
	});
	event.on('click', function() {
		count++;	
	});
	event.trigger('click');
	expect(count).toBe(1);
});

it('with return', function() {
	var event = new Event('test4');
	event.on('click', function() {
		return 1;	
	});
	event.on('click', function() {
		return 3;	
	})
	event.on('click', function() {
	});

	var ret = event.trigger('click');
	expect(ret).toBe(3);
});

it('can use namespace', function() {
	var event = new Event('namespace');
	var count = 0;
	event.on('click.a', function() {
		count++;
	});

	event.on('click.b', function() {
		count += 2;	
	});

	expect(count).toBe(0);
	event.trigger('click');
	expect(count).toBe(3);

	event.trigger('click.a')
	expect(count).toBe(4);

	event.trigger('click.b')
	expect(count).toBe(6);

	event.trigger('click')
	expect(count).toBe(9);

	event.off('click.b');
	event.trigger('click');
	expect(count).toBe(10);
	event.trigger('click.b');
	expect(count).toBe(10);

	event.off('click');
	event.trigger('click');
	expect(count).toBe(10);
});

});
