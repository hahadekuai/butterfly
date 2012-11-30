/**
 * 工具模块
 * @author qijun.weiq
 */
define('util.Util', ['jQuery'], 

function($) {

var Util = {

	/**
	 * 拼接url
	 * @param {string} url
	 * @param {object} param
	 */
	formatUrl: function(url, param) {
		url = url || '';
		param = param || '';
		param = (typeof param === 'string') ? param : $.param(param);
		return param ? url + (url.indexOf('?') === -1 ? '?' : '&') + param : url;
	},


	/**
	 * 同一name名称的操作覆盖执行
	 * @param {string} name 名称
	 * @param {function} action
	 * @param {number} delay
	 */
	schedule: function(name, action, delay) {
		this._schedule[name] && clearTimeout(this._schedule[name]);
		this._schedule[name] = 0;
		if (!action) {
			return;
		}
		
		if (delay === 0) {
			action();
		} else {
			this._schedule[name] = setTimeout(action, delay || 1000);
		}
	},

	escape: function(str){
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	},

	_schedule: {},

	toCamelString: function(str) {
		return str.replace(/-(\w)/g, function(r, m) {
			return m.toUpperCase();
		});
	},

    toPascalString: function(str) {
       str = this.toCamelString(str);
       return str.substr(0, 1).toUpperCase() + str.substr(1);
    },
	
	/**
	 * 生成一个新的对像，代理的指定方法和属性
	 */
	delegate: function(o, fields) {
		var proxy = {};
		$.each($.makeArray(fields), function(index, field) {
			var v = o[field];
			proxy[field] = typeof v === 'function' ? $.proxy(v, o) : v;
		});
		return proxy;
	},
	
	/**
	 * 取得url中指定参数
	 */
	getUrlParam: function(name) {
		this._urlParams = this._urlParams || this._getUrlParams();
		return name ? this._urlParams[name] : this._urlParams;
	},

	_getUrlParams: function() {
		var params = {},
			pattern = /^([^=]+)=(.*)$/,
			parts = window.location.search.replace(/^\?/, '').split('&');

		$.each(parts, function(index, part) {
			var m = pattern.exec(part);
			if (m) {
				params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
			}
		});

		return params;
	}
  
};

return Util;

		
});
