/**
 * 用于方便UI组件的创建
 * 1. 默认参数的支持
 * 2. 事件的支持
 *
 *	@author qijun.weiqj
 */
define('ui.Widget', ['jQuery', 'Log'], function($, Log) {

var log = new Log('ui.Widget');

var Widget = function(proto) {
	var widget = function(div, options) {
		var self = this;

		this.element = $(div);	
		this.options = $.extend({}, proto.defaultOptions, options);

		this.element.on('widget-action', function(e, data) {
			self[data.name].apply(self, data.args || []);
		});
		
		return proto.init && proto.init.apply(this, arguments);
	};

	var getConfigObject = function(type, name) {
		name = name || 'default';
		ret = typeof name === 'string' ? widget[type][name] : name;
		ret || log.warn('get return null for ' + type + ':' + name);
		return ret;
	};

	widget.prototype = $.extend({ getConfigObject: getConfigObject }, Proto, proto);

	return widget;
};


var Proto = {
	on: function(type, data, fn) {
		this.element.on('widget-' + type, data, fn);
		return this;
	},

	off: function(type) {
		this.element.off('widget-' + type);
		return this;
	},

	trigger: function(type, data) {
		this.triggerHandler(type, data, true);
		return this;
	},

	triggerHandler: function(type, data, flag) {
		log.info('trigger ' + type);

		var ret1,
			ret2,
			fn = this.options['on' + type] || this.options[type];

		data = $.isArray(data) ? data : [data];

		if (typeof fn === 'function') {
			ret1 = fn.apply(this, data);
		}

		ret2 = this.element[flag ? 'trigger' : 'triggerHandler'](type, data);

		return ret2 === undefined ? ret1 : ret2;
	}

};

return Widget;

		
});
