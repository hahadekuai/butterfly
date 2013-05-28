/**
 * 页面组件化
 * @author qijun.weiqj
 */
define('context.Application', 

	['jQuery', 'Class', 'Log', 'lang.Event', 'context.Executor', 
	'context.Context', 'context.ModContext', 'context.Autowire'], 

function($, Class, Log, Event, Executor,
		Context, ModContext, Autowire) {

var log = new Log('context.Application');

var App = Class({
	
	/**
	 * options {object} 配置信息
	 * - id 名称
	 * - loader loader配置
	 * - pageContext
	 *		- node 默认为'body'
	 *		- configField 默认为'pageConfig'
	 *		- @see context.Context
	 * - modContext
	 *		- @see context.ModContext
	 * - exportModule 导出模块
	 */
	init: function(options) {
		options = options || {};
		this.options = options;

		this.id = options.id || 'app';
		this.namespace = options.namespace || this.id.toLowerCase().replace(/\./g, '\\.');

		log.info('init application:', this.id);

		this._cache = {};

		this._initLoader();	
		this._initEvent();
		this._initExecutor();
		this._initPageContext();
		this._initModContext();
	},

	start: function() {
		var self = this;
		this.timestamp('start');
		$(function() {
			self.executor.execute('domready', function() {
				self.pageContext && self.pageContext.start();	
				self.modContext && self.modContext.start();
				self._startAutowire();
			});

			self.event.setLazy(false);
			self.timestamp('start');

			self._report();
		});
	},

	get: function(name) {
		var value = this._cache[name],
			o = this.event.trigger('get', name, value);
		if (o !== undefined && o !== null) {
			return o;
		}
		return value;
	},

	set: function(name, value) {
		var o = this.event.trigger('set', name, value);
		if (o !== false) {
			if (o !== undefined && o !== null) {
				value = o;
			}
			this._cache[name] = value;	
		}
	},

	_initLoader: function() {
		var self = this,
			options = this.options;

		this.loader = butterfly.config(options.loader || {});
		this._delegate(this.loader, ['define', 'require', 'isDefine']);

		this.loader.define(this.namespace + '.core.App', function() {
			return self;	
		});
	},

	_initEvent: function() {
		var event = this.event = new Event(this);
		event.mixto(this);
		event.setLazy(true);

		this.loader.define(this.namespace + '.core.Event', function() {
			return event;
		});
	},

	_initExecutor: function() {
		var executor = new Executor({ error: $.proxy(this, '_error') });	
		this.executor = executor;
		this.loader.define(this.namespace + '.core.Executor', function() {
			return executor;
		});

		this._delegate(this.executor, ['timestamp']);
	},

	_error: function(e) {
		if (log.isEnabled('debug')) {
			throw e;
		} else {
			log.error(e);
		}
		this.event.trigger('error', e);
	},

	_initPageContext: function() {
		var o = this.options.pageContext;
		if (!o) {
			return;
		}

		var id = o.id || this.namespace + '.core.PageContext',
			executor = this.executor,
			configField = o.configField || 'pageConfig';

		log.info('init PageContext:', id);

		var config = {
			loader: this.loader,
			moduleFilter: new RegExp('^' + this.namespace + '\\.page\\.'),

			query: function() {
				return $(config.node || 'body');
			},

			bind: function(node, name, event, module) {
				executor.execute(name, function() {
					module.init(node, node.data(configField));	
				});
			}
		};

		$.isPlainObject(o) && $.extend(config, o);

		var pageContext = new Context(id, config);

		this.pageContext = pageContext;

		this.loader.define(id, function() {
			return pageContext;	
		});
	},

	_initModContext: function() {
		var o = this.options.modContext;
		if (!o) {
			return;
		}

		var id = o.id || this.namespace + '.core.ModContext';

		log.info('init ModContext:', id);

		var config = {
			loader: this.loader,
			event: this.event,
			executor: this.executor,
			moduleFilter: new RegExp('^' + this.namespace + '\\.mod\\.')
		};

		$.isPlainObject(o) && $.extend(config, o);
		var modContext = new ModContext(id, config);

		this.modContext = modContext;

		this.loader.define(id, function() {
			return modContext;
		});

		this.callModMethod = $.proxy(modContext, 'callModMethod');
	},

	_startAutowire: function() {
		var o = this.options.autowire;
		if (!o) {
			return;
		}

		log.info('start Autowire');

		var config = {
			loader: this.loader,
			executor: this.executor
		};

		$.isPlainObject(o) && $.extend(config, o);

		new Autowire($(o.container || 'body'), config);
	},

	_delegate: function(o, names) {
		var self = this;
		$.each(names, function(index, name) {
			self[name] = $.proxy(o, name);
		});
	},

	_report: function() {
		if (log.isEnabled('info')) {
			log.info('\n\n' + this.executor.report() + '\n\n');
		}
	}

});

return App;

});

