/**
 * 管理一组与节点相关的模块
 * @author qijun.weiqj
 */
define('context.Context', ['jQuery', 'Class', 'Log'], 

function($, Class, Log) {

var Context = Class({

	/**
	 * @param {string} id context id
	 * @param {object} attachment
	 *  - loader for auto register
	 *  - moduleFilter {package|regexp|function} for auto register to filter module
	 *
	 *	- before(context) -> {boolean}
	 *	- query(name, type) -> node
	 *	- bind(node, type, module, [options])
	 *	- resolve(node) -> name
	 */
	init: function(id, attachment) {
		this.id = id;
		
		this._log = new Log(id);
		this._log.info('init');

		this._attachment = attachment;

		/*
		 * [
		 *		{
		 *			name: name,
		 *			types: {
		 *				'default': module,
		 *				'exposure': module
		 *			}
		 *		},
		 *		...
		 * ]
		 */
		this._modules = [];
		this._indices = {};

		this._autoRegister();
	},

	/**
	 * alias for add
	 */
	register: function() {
		return this.add.apply(this, arguments);
	},

	/**
	 * 添加模块到容器
	 *
	 * @param {string} name 名称
     * @param {string} type 类型
	 * @param {function|object} 模块
	 */
	add: function(name, type, module) {
		// add(name, module)
		if (!module) {
			module = type;
			type = 'default';
		}

		var item = this._get(name);
		if (!item) {
			this._indices[name] = this._modules.length;
			item = { name: name, types: {} };
			this._modules.push(item);
		}
		
		if (item.types[type]) {
			this._log.warn(name + '['+ type + '] is already added');
			return;
		} 

		item.types[type] = {
			name: name,
			type: type,
			module: module,
			times: 0
		};

		this._log.info(name + '['+ type + '] is added');
		
		// 如果context已start, 则直接进行start该模块
		// 比如domready之后注册模块的情况
		this._started && this._start(name, item.types[type]);
	},

	/**
	 * 执行容器内模块的初始化
	 *
	 *	attachment.before -> not false
	 *
	 *		foreach module in context
	 *			foreach type in item
	 *				node = attachment.query(name, type)
	 *				attachment.bind(node, type, module)
	 *
	 *	attachment.after
	 */
	start: function() {
		var self = this,
			attach = this._attachment;

		this._log.info('starting...');
			
		if (attach.before && attach.before(this) === false) {
			this._started = true;
			return;
		}

		$.each(this._modules, function(i, item) {
			$.each(item.types, function(type, o) {
				self._start(item.name, o);
			});
		});
		
		this._started = true;
		this._log.info('started');
	},

	/**
	 * 绑定节点和模块
	 * 根据名称查询节点，再进行绑定
	 *
	 * @param {string} name 名称
	 * @o {object}
	 *	- type
	 *	- module
	 *	- times
	 */
	_start: function(name, o) {
		var self = this,
			attach = this._attachment,
			node = attach.query ? attach.query(name, o.type) : name;

		if (!node) {
			this._log.info('no node query for context ' + name + '[' + o.type + ']');
			return;
		}

		this._bind(name, node, o);
	},

	/**
	 * 绑定模块到节点
	 */
	_bind: function(name, node, o, options) {
		var self = this,
			attach = this._attachment;

		this._log.info('bind module for ' + name + '[' + o.type + ']');
		attach.bind(node, name, o.type, o.module, options);
		o.times++;
	},

	/**
	 * 将node与模块关联
	 * @param node 节点, 可以是抽像的节点, 一般为dom节点或jquery对象
	 * @param type 类型, 默认为default
	 * @param options 可选的额外数据, 可以由attachment在bind方法实现中使用
	 */
	attach: function(node, type, options) {
		if (arguments.length === 2 && typeof type !== 'string') {
			options = type;
			type = null;
		}
		type = type || 'default';

		var attach = this._attachment,
			name = attach.resolve ? attach.resolve(node) : node,
			o = name ? this._get(name, type) : null;

		if (o) {
			this._bind(name, node, o, options);
			return true;
		} else {
			this._log.info('no context for node: ' + node);
			return false;
		}
	},

	/**
	 * 取得指定名称和事件的模块
	 * @param {string} name  模块名称
	 * @param {string} type 类型名称, 默认为default
	 */
	_get: function(name, type) {
		var index = this._indices[name],
			item = null;

		if (index === undefined) {
			return null;
		}

		item = this._modules[index];
		return type ? item.types[type] : item;
	},

	/**
	 * 取得指定名称和事件的模块
	 * @see _get
	 */
	get: function(name, type) {
		var o = this._get(name, type || 'default');
		return o ? o.module : null;
	},

	/**
	 * auto register module to context
	 */
	_autoRegister: function() {
		var self = this,
			attach = this._attachment,
			loader = attach.loader,
			filter = attach.moduleFilter;

		if (!loader || !filter) {
			return;
		}

		this._log.info('init auto register');
		loader.on('define', function(module) {
			if (self._match(filter, module.id)) {
				loader.require([module.id], function(o) {
					self.add(module.id, o);
				});
			}
		});
	},

	_match: function(filter, id) {
		return typeof filter === 'function' ? filter(id) :
				filter.test ? filter.test(id) : false;
	}

});
//~


return Context;

		
});
