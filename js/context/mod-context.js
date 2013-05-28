/**
 * 提供一种页面组件化的方式
 * @author qijun.weiqj
 */
define('context.ModContext', 

['jQuery', 'Class', 'Log', 'lang.Event', 'context.Context'], 
function($, Class, Log, Event, Context) {

var log = new Log('context.ModContext');

var guid = $.now(),
	proxy = function() {};

/**
 * @param id
 * @param config
 *	- loader
 *	- moduleFilter
 *	- async
 *
 *	- queryMods
 *	- selector
 *	- container
 */
var ModContext = function(id, config) {
	var event = config.event || new Event(),
		context = new Context(id, new Attach(config));

	event.mixto(context);

	context.callModMethod = function(mod, method, args) {
		var o = mod.data('modContext');
		if (o) {
			log.info('call mod method: ' + o.name + '.' + method);
			return o.context[method].apply(o.context, args || []);
		}
	};

	return context;
};
//~

var Attach = new Class({

	init: function(config) {
		this.config = config;

		this.loader = config.loader;
		this.moduleFilter = config.moduleFilter;

		// 用于更快速地根据模块查询节点
		this._cache = {};
	},

	before: function(context) {
		this.context = context;

		var config = this.config,
			event = context;

		var queryMods = config.queryMods || function() {
			return $(config.selector || '[data-mod-id]', config.container || 'body');
		};

		event.on('mod-ready', function(node, params) {
			context.attach(node, 'default', params);
		});

		queryMods().each(function() {
			event.trigger('mod-ready', $(this));
		});

		event.trigger('mod-all-ready');

		// break context routine
		return false;
	},

	/**
	 * context.start之后注册的模块会走query对节点进行初始化
	 */
	query: function(name) {
		var ids = this._cache[name];
		if (!ids) {
			return null;
		}
		
		var node = $();
		$.each(ids, function(index, id) {
			node.add($('#' + id));
		});

		delete this._cache[name];
		return node;
	},

	resolve: function(node) {
		var config = this.config,
			id = config.resolve ? config.resolve(node) : node.data('modId');

		if (!this.context.get(id)) {
			var list = this._cache[id];
			if (!list) {
				list = this._cache[id] = [];
			}
			list.push(this._nodeId(node));

			config.async && this._proxy();
		}

		return id;
	},

	bind: function(node, name, type, module, params) {
		var self = this;
		if (node.length === 1) {
			this._bind(node, name, type, module, params);
		} else {
			node.each(function() {
				self._bind($(this), type, module, params);	
			});
		}
	},

	_bind: function(node, name, type, module, params) {
		var config = this.config;
		if (config.bind) {
			return config.bind(node, name, type, module, params);
		}

		var event = this.context;

		var fn = function() {
			var config = node.data('modConfig'),
				context = null,
				entry = null;
			
			if (typeof module === 'function') {
				proxy.prototype = module.prototype;
				context = new proxy();
				entry = module;
			} else {
				context = module;
				entry = module.init;
			}

			var o = {
				node: node,
				name: name,
				module: module,

				context: context,
				config: config,
				params: params
			};

			node.data('modContext', o);
			if (event.trigger('mod-before-init', o) !== false) {
				o.result = entry.apply(context, [node, config, params]);
				event.trigger('mod-inited', o);
			}
		};

		config.executor ? config.executor.execute(name, fn) : fn();
	},

	_nodeId: function(node) {
		var id = node.attr('id');
		if (!id) {
			id = 'mod-' + guid++;
			node.attr('id', id);
		}
		return id;
	},

	/**
	 * 生成一个代理模块来处理异步加载模块
	 */
	_proxy: function(id) {
		var self = this,
			loader = this.loader;	
		if (!loader) {
			log.warn('loader not specified');
			return;
		}

		this.context.register(id, function() {
			var o = this,
				args = arguments;	
			loader.require([id], function(module) {
				var method = typeof module === 'function' ? 
					module : module.init;
				method.apply(o, args);
			});
		});
	}

});
//~ Attach

return ModContext;


});
