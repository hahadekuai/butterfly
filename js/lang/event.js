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
	this.lazyList = [];

	this.off = util.proxy(this.event, 'off');
};

Event.prototype = {

	on: function(type, fn) {
		log.info('on', type);

		var self = this;
		this.event.on.apply(this.event, arguments);
		this.lazy && util.each(this.lazyList, function(index, item) {
			if (item.type === type) {
				log.info('lazy trigger: ', type);
				fn.apply(self.event.target, item.args);
			}
		});
	},

	trigger: function(type) {
		log.info('trigger', type);
		this.lazy && this.lazyList.push({
			type: type,
			args: arguments
		});

		return this.event.trigger.apply(this.event, arguments);
	},

	off: function(type) {
		log.info('off', type);
		return this.event.off.apply(this.event, arguments);
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

	setLazy: function(lazy) {
		this.lazyList.length = 0;
		this.lazy = lazy;
	}

};

return Event;

});
