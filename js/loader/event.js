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

	trigger: function(type) {
		this._log.info('trigger', type);
		var list = this._cache[type],
			ret;
		if (list) {
			var args = [].slice.call(arguments, 1),
			for (var i = 0, c = list.length; i < c; i++) {
				ret = list[i].apply(this.target, args);
				if (ret === false) {
					break;
				}
			}
		}
		return ret;
	}
};

return Event;
		
});
//~event

define('event/loader', ['event'], function(Event) {
	return new Event('loader');
});

