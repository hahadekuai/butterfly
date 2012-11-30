/**
 * ����ģ��
 * @author qijun.weiq
 */
define('util.Util', ['jQuery'], 

function($) {

var Util = {

	/**
	 * ƴ��url
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
	 * ͬһname���ƵĲ�������ִ��
	 * @param {string} name ����
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
	 * ����һ���µĶ��񣬴����ָ������������
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
	 * ȡ��url��ָ������
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
