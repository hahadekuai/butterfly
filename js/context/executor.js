/**
 * 统一的异常处理
 * 统一的执行时间记录, 由log模块输出
 *
 * @author qijun.weiqj
 */
define('context.Executor', ['jQuery', 'lang.Class', 'lang.Log'],

function($, Class, Log) {

'use strict'

var log = new Log('context.Executor');

	
return new Class({

	init: function(options) {
		options = options || {};
		this.error = options.error || $.proxy(this, '_error');
		this._timestamps = [];
	},


	_error: function(e) {
		if (log.isEnabled('debug')) {
			throw e;
		} else {
			log.error(e);
		}
	},


	timestamp: function(name) {
		var stamp = this._getstamp(name);
		if (stamp) {
			stamp.cost = new Date().getTime() - stamp.time;
		} else {
			stamp = { name: name, time: new Date().getTime() };
			this._timestamps.push(stamp);
		}
		return stamp;
	},


	_getstamp: function(name) {
		var stamps = this._timestamps;	
		for (var i = 0, c = stamps.length; i < c; i++) {
			if (stamps[i].name === name) {
				return stamps[i];
			}
		}
	},


	report: function() {
		var stamps = this._timestamps,
			lines = [];

		var times = function(ch, times) {
			var ary = [];	
			times > 0 && (ary.length = times + 1);
			return ary.join(ch);
		};

		var left = function(text, width) {
			return text + times(' ', width - text.length);
		};

		var center = function(text, width) {
			width = width - text.length;
			var w = Math.round(width / 2);
			return times(' ', w) + text + times(' ', width - w);
		};

		var right = function(text, width) {
			return times(' ', width - text.length) + text;
		};
		
		var line = function() {
			var ary = [];	
			ary.push.apply(ary, arguments);
			lines.push(ary.join(''));
		};

		line(center('Executor Report', 104));
		line(times('=', 104));
		line(times(' ', 1), center('Name', 60), '|', center('Stamp', 20), '|', center('Cost(ms)', 20), times(' ', 1));
		line(times('=', 104));

		$.each(stamps, function(index, stamp) {
			var cost = stamp.cost !== undefined ? '' + stamp.cost : '';
			line(times(' ', 1), left(stamp.name, 60), '|', center('' + stamp.time, 20), '|', right(cost, 20), times(' ', 1));
			line(times('-', 104));
		});

		var first = stamps[0],
			last = stamps[stamps.length - 1];

		if (first && last) {
			var total = last.time - first.time;
			if (last.cost) {
				total += last.cost
			}
			line(right('Total: ' + total + ' ms', 104));
		}

		return lines.join('\n');
	},


	execute: function(name, fn) {
		this.guid++;
		if (!fn) {
			fn = name;
			name = this.guid;
		}

		try {
			var stamp = this.timestamp(name);

			log.info('[' + name + '] start');

			fn();

			this.timestamp(name);

			log[stamp.cost > 100 ? 'warn' : 'info']('[' + name + '] cost ' + stamp.cost + ' ms');
		} catch (e) {
			this.error(e);
		}
	},


	guid: 1
	
});


});
