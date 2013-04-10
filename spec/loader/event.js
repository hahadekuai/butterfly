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

	var times = 0;
	event.one('user', function() {
		times++;	
	});
	event.trigger('user');
	event.trigger('user');
	expect(times).toBe(1);
});

it('mixin', function() {
	var o = { };

	Event.mixin(o);
	
	var f = 0;
	o.on('open', function(data) {
		f = data;	
	});
	o.trigger('open', 123);
	expect(f).toBe(123);
});

		
});
