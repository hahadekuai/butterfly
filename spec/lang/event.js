define('spec.lang.Event', ['lang.Event'], function(Event) {

describe(this.id, function() {

it('event', function() {
	var event = new Event('test');

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

	
});
