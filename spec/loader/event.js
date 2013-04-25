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

});
