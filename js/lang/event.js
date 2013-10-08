/**
 * event 扩展
 * @author qijun.weiqj
 */
define('lang.Event', ['lang.Lang', 'lang.Log'], function(_, Log) {

'use strict'


var log = new Log('lang.Event');


var Event = function(target) {
	this.target = target;
	this.isLazy = false;
	this._cache = {};
	this._lazyList = [];
};


Event.prototype = {
	on: function(type, fn) {
		log.debug('on', type);

		var o = param(type),
			list = this._cache[o.type];
		if (!list) {
			list = this._cache[o.type] = [];
		}

		list.push({ namespace: o.namespace, fn: fn });
		this.isLazy && triggerLazy(this, type, fn);

		return this;
	},


	off: function(type, fn) {
		log.debug('off', type);

		var o = param(type),
			list = this._cache[o.type];
		if (!list) {
			return;
		}
		
		for (var i = list.length - 1; i >= 0; i--) {
			var item = list[i];
			if (match(item.namespace, o.namespace) &&
					(fn ? item.fn === fn : true)) {
				list.splice(i, 1);
			}
		}
		
		if (list.length === 0) {
			delete this._cache[o.type];
		}

		return this;
	},


	trigger: function(type) {
		log.debug('trigger', type);

		this.isLazy && this._lazyList.push({ type: type, args: arguments });

		var o = param(type),
			list = this._cache[o.type];

		if (!list || list.length === 0) {
			return;
		}

		var ret,
			args = [].slice.call(arguments, 1);

		for (var i = 0, c = list.length; i < c; i++) {
			var item = list[i];
			if (match(item.namespace, o.namespace)) {
				var tmp = item.fn.apply(this.target, args);
				if (tmp !== undefined && tmp !== null) {
					ret = tmp;
				}
				if (ret === false) {
					break;
				}
			}
		}

		return ret;
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
		_.each(['on', 'off', 'trigger', 'one'], function(index, type) {
			o[type] = o[type] || _.proxy(self, type);
		});
		return this;
	},


	setTarget: function(target) {
		this.target = target;
	},


	setLazy: function(lazy) {
		this.isLazy = lazy;
		this._lazyList.length = 0;
	}
};


var param = function(type) {
	var parts = type.split('.');
	return {
		type: parts[0],
		namespace: parts.slice(1).join('.')
	}	
};


var match = function(namespace, now) {
	return now ? namespace.indexOf(now) === 0 : true;	
};


var triggerLazy = function(self, type, fn) {
	_.each(self._lazyList, function(index, item) {
		if (item.type === type) {
			log.info('lazy trigger: ', type);
			fn.apply(self.target, item.args);
		}
	});
};


return Event;


});
