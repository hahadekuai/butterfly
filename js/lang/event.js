/**
 * event 扩展
 * @author qijun.weiqj
 */
define('lang.Event', ['loader'], function(loader) {

var util = loader.require('util'),
	Event = loader.require('event');

util.extend(Event.prototype, {
	one: function(type, fn) {
		var self = this,
			wrap = function() {
				fn.apply(this, arguments);
				self.off(type, wrap);
			};
		this.on(type, wrap);
	}
});


util.extend(Event, {
	mixin: function(name, o) {
		if (!o) {
			o = name;
			name = o.name || '';
		}
		var event = new Event(name, o);
		util.each(['on', 'off', 'trigger', 'one'], function(index, type) {
			o[type] = o[type] || util.proxy(event, type);
		});
	}
});


return Event;

		
});
