/**
 * event
 */
define('event', ['util', 'log'], function(util, Log) {

var Event = function(name) {
	this.name = name || '';
	this._log = new Log('event' + (name ? '/' + name : ''));
	this.target = this;
	this._cache = {};
};

Event.prototype = {
	on: function(type, fn) {
		this._log.info('on', type);
		var list = this._cache[type];
		if (!list) {
			list = this._cache[type] = [];
		}
		list.push(fn);
	},

	off: function(type, fn) {
		this._log.info('off', type);
		var list = this._cache[type];
		if (!list) {
			return;
		}
		if (fn) {
			for (var i = 0, c = list.length; i < c; i++) {
				if (list[i] === fn) {
					list.splice(i, 1);
					break;
				}
			}
		} else {
			this._cache[type] = null;
		}
	},

	one: function(type, fn) {
		var self = this;
			wrap = function() {
				fn.apply(this, arguments);
				self.off(type, wrap);
			};
		this.on(type, wrap);
	},

	trigger: function(type, o) {
		this._log.info('trigger', type);
		var list = this._cache[type];
		if (list) {
			for (var i = 0, c = list.length; i < c; i++) {
				list[i].call(this.target, o);
			}
		}
	}
};

Event.mixin = function(name, o) {
	if (!o) {
		o = name;
		name = o.name || '';
	}
	var event = new Event(name);
	event.target = o;
	util.each(['on', 'off', 'trigger', 'one'], function(index, type) {
		o[type] = o[type] || util.proxy(event, type);
	});
};

return Event;
		
});
//~event

define('event/loader', ['event'], function(Event) {
	return new Event('loader');
});

