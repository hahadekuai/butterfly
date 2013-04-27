/**
 * 统一的异常处理
 * 统一的执行时间记录, 由log模块输出
 *
 * @author qijun.weiqj
 */
define('context.Executor', ['jQuery', 'Class', 'Log'],

function($, Class, Log) {

var log = new Log('context.Executor'),
	proxy = function() {};
	
return new Class({

	init: function(options) {
		options = options || {};
		this.error = options.error || $.proxy(log, 'error');
	},

	execute: function(fn) {
		try {
			var time = new Date().getTime(),
				guid = this.guid++;

			log.info('[' + guid + '] start');

			fn();

			time = new Date().getTime() - time;

			log[time > 100 ? 'warn' : 'info']('[' + guid + '] cost ' + time + ' ms');
		} catch (e) {
			this.error(e);
		}
	},

	guid: 1
	
});


});
