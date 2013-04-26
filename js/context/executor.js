/**
 * 用于执行一个模块/类/普通对象方法
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
		this.loader = options.loader || options.load;
		this.error = options.error || $.proxy(log, 'error');
	},

	/**
	 * execute(function, context, args)
	 * execute(function, null, args)
	 * execute(function, args);
	 *
	 * execute(context, name, args)
	 * execute(context, args);	// name = 'init'
	 * 
	 * execute(module, context|name, args) 
	 *		-> execute(load(module), context, args);
	 */
	execute: function(method, context, args) {
		// execute(module|function|context, args)
		if (args === undefined && $.isArray(context)) {
			args = context;
			context = null;
		}

		var self = this,
			type = typeof method;

		// execute(function, context, args)
		if (type === 'function') {
			this._call(context, method, args);
		
		// execute(module, context|name, args)
		} else if (type === 'string') {
			this._load(method, function(o) {
				o && self.execute(o, context, args);
			});
		} else if (method) {
			// execute(context, name, args);
			context = method[typeof context === 'string' ? context : 'init'];
			if (typeof context === 'function') {
				this._call(method, context, args);
			} else {
				this.error('parameters error: context should be function');
			}
		} else {
			this.error('parameters error: invalid method');
		}
	},

	_call: function(o, method, args) {
		var time = null,
			guid = this.guid++,
			ext = null;
		try {
			time = (new Date()).getTime();
			log.info('[' + guid + '] start');

			if (o === true) {
				proxy.prototype = method.prototype;
				o = new proxy();
			}

			args = args || [];
			method.apply(o, args);

			time = (new Date()).getTime() - time;
			ext = time > 100 ? '!!!!!' : '';
			log.info('[' + guid + '] cost ' + time + ' ms' + ext);
		} catch (e) {
			this.error(e);
		}
	},

	_load: function(module, success) {
		var self = this,
			// 首先从以名字空间中取，如a.b.c -> window['a']['b']['c']
			o = this._get(module);
		if (o) {
			success(o);
		} else if (this._loader) {
			// 如果有loader，则使用loader来载入模块
			this.loader(module, success, function() {
				log.error('load module [' + module + '] fail');
			});
		} else {
			this.error('can not resolve module [' + module + ']');
		}
	},

	_get: function(module) {
		var parts = module.split('.'),
			o = window;
		for (var i = 0, c = parts.length; i < c; i++) {
			o = o[parts[i]];
			if (!o) {
				return;
			}
		}
		return o;
	},

	guid: 1
	
});


});
