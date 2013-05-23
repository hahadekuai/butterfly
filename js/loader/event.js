/**
 * event
 */
define('event', ['util', 'log'], function(util, Log) {

var Event = function(name, target) {
	this.name = name || '';
	this.target = target;
	this._log = new Log('event:' + (name ? ' ' + name : ''));
	this._cache = {};
};

Event.prototype = {
	on: function(type, fn) {
		this._log.debug('on', type);

		var o = this._param(type),
			list = this._cache[o.type];
		if (!list) {
			list = this._cache[o.type] = [];
		}

		list.push({
			namespace: o.namespace,
			fn: fn
		});

		return this;
	},

	off: function(type, fn) {
		this._log.debug('off', type);

		var o = this._param(type),
			list = this._cache[o.type];
		if (!list) {
			return;
		}
		
		for (var i = list.length - 1; i >= 0; i--) {
			var item = list[i];
			if (this._match(item.namespace, o.namespace) &&
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
		this._log.debug('trigger', type);

		var o = this._param(type),
			list = this._cache[o.type];

		if (!list || list.length === 0) {
			return;
		}

		var ret,
			args = [].slice.call(arguments, 1);

		for (var i = 0, c = list.length; i < c; i++) {
			var item = list[i];
			if (this._match(item.namespace, o.namespace)) {
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

	_param: function(type) {
		var parts = type.split('.');
		return {
			type: parts[0],
			namespace: parts.slice(1).join('.')
		}
	},

	_match: function(namespace, now) {
		return now ? namespace.indexOf(now) === 0 : true;	
	}
};

return Event;
		
});
//~event

define('loaderEvent', ['event'], function(Event) {
	return new Event('loader');
});

