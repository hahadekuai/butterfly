/**
 * event 扩展
 * @author qijun.weiqj
 */
define('lang.Event', ['loader', 'lang.Log'], function(loader, Log) {

var util = loader.require('util'),
	cEvent = loader.require('event'),
	log = new Log('lang.Event');

var Event = function(target) {
	this.event = new cEvent(target);
	this._delegate();
};
Event.prototype = {
	_delegate: function() {
		var self = this,
			event = this.event;
		util.each(['on', 'off', 'trigger'], function(index, name) {
			self[name] = function(type) {
				log.info(name, type);
				return event[name].apply(event, arguments);
			};
		});
	},

	one: function(type, fn) {
		var self = this,
			wrap = function() {
				fn.apply(this, arguments);
				self.off(type, wrap);
			};

		this.on(type, wrap);
	},

	mixto: function(o) {
		var self = this;
		util.each(['on', 'off', 'trigger', 'one'], function(index, type) {
			o[type] = o[type] || util.proxy(self, type);
		});
		return this;
	},

	setTarget: function(target) {
		this.event.target = target;
	},

	setDelay: function(delay) {
		
	}
};

return Event;

});
