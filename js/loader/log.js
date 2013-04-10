/**
 * Simple log support
 *
 * create new log instance
 *
 * var log = new Log(type)
 * 
 * log.log(msg, level)
 * log.error(msg)
 * log.warn(msg)
 * log.info(msg)
 * log.debug(msg)
 * 
 * log.LEVEL
 * log.level
 * log.isEnabled
 *
 * use global log direct
 *
 * log(msg, level)
 * log.error(msg)
 * log.warn(msg)
 * log.info(msg)
 * log.debug(msg)
 */
define('log', ['util', 'global'], function(util, global) {

var LEVEL = { none: 0, error: 1, warn: 2, info: 3, debug: 4 },
	level = (function() {
		var location = global.location,
			search = location && global.location.search || '',
			level = (/debug-log-level=(\w+)\b/.exec(search) || {})[1] || 'error';
		return LEVEL[level];
	})();


var Log = function(type) {
	this.type = type || 'Anonymous';
};

var member = Log.prototype = {
	LEVEL: LEVEL,
	level: level,

	isEnabled: function(level) {
		level = typeof level === 'string' ? LEVEL[level] : level;
		return level <= this.level;	
	},

	log: function(msg, level) {
		level = level || 'info';
		if (this.isEnabled(level)) {
			log.handler(msg, level, this.type);
		}
		return this;
	}
};

var join = [].join;
util.each(LEVEL, function(level) {
	member[level] = function() {
		var msg = join.call(arguments, ' ');
		return this.log(msg, level);
	};
});
//~Log

var log = function(type) {
	if (global === this) {
		log.log.apply(log, arguments);
		return log;
	} else {
		return new Log(type);
	}
};

util.extend(log, member);

// can be overrided by other module
log.handler = global.console ? function(msg, level, type) {
	msg = (type ? '[' + type + '] ' : '') + msg;
	if (console[level]) {
		console[level](msg);
	} else if (console.log) {
		console.log(msg);
	}
} : function() {};

return log;

});
