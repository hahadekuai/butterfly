/**
 * 表单元素工具方法
 * @author qijun.weiqj
 */
define('ui.FormUtil', ['jQuery'], function($) {


var FormUtil = {

	getFormData: function(node) {
		if (!node) {
			throw new Error('should specify node for getFormData');
		}

		var groups = $('div[data-form-group]', node);
		if (!groups.length) {
			return this._getFormData(node);
		}
		
		var self = this,
			data = {};
		groups.each(function() {
			var group = $(this),
				name = group.data('formGroup');
			data[name] = self._getFormData(group);
		});
		return data;
	},

	_getFormData: function(node) {
		var self = this,
			data = {},
			elms = null;
			
		elms = $('input:text,textarea,select,input[type=hidden]', node);	
		elms.each(function() {
			self._put(data, this, 'text');
		});

		elms = $('input:radio', node);
		elms.each(function() {
			self._put(data, this, 'radio');
		});

		elms = $('input:checkbox', node);
		elms.each(function() {
			self._put(data, this, 'checkbox');
		});

		return data;
	},

	_put: function(data, elm, type) {
		elm = $(elm);
		var name = elm.attr('name');
		if (!name) {
			return;
		}

		var dataType = elm.data('type'),
			fieldType = elm.data('fieldType') || dataType,
			value = elm.val();
		
		if (type === 'radio') {
			if (!elm.prop('checked')) {
				value = undefined;
			}
			if (!dataType) {
				value = value === 'true' ? true :
						value === 'false' ? false : value;
			}
		} else if (type === 'checkbox') {
			if (fieldType || (dataType && dataType !== 'boolean')) {
				value = elm.prop('checked') ? value : undefined;
			} else {
				value = !!elm.prop('checked');
			}
		}

		if (dataType && this._dataFilter[dataType]) {
			value = this._dataFilter[dataType](value);
		}
		
		if (fieldType === 'array') {
			data[name] = data[name] || [];
			value !== undefined && data[name].push(value);
		} else if (value !== undefined) {
			data[name] = value;
		}
	},

	_dataFilter: {
		'number': function(v) {
			return parseFloat(v) || 0;
		},
		
		'boolean': function(v) {
			return !!v;
		},

		'json': function(v) {
			if (typeof v !== 'string') {
				return v;
			}
			try {
				return $.parseJSON(v);
			} catch (e) {
				return undefined;
			}
		}
	},

	alert: function(elm, message, type) {
		var elm = $(elm),
			span = this._getAlertElm(elm),
			prompt = false;

		type = type || 'error';
	
		var prompt = span.data('alertPrompt');
		if (prompt === undefined) {
			prompt = span.html();
			span.data('alertPrompt', prompt);
		}

		if (message) {
			message = message === true ? prompt : message;

			span.html(message);
			span.removeClass('alert-success alert-error alert-warn alert-prompt');
			span.addClass('alert-' + type).show();

		} else {
			span.removeClass('alert-success alert-error alert-warn');
			span.addClass('alert-prompt');
			prompt ? span.html(prompt) : span.hide();
		}
	},

	_getAlertElm: function(elm) {
		var span = elm.parent().find('.alert');
		return span.length ? span : elm.closest('.controls').find('.alert');
	},

	/**
	 * 配合后端标准出错数据结构，取得某个字段的出错信息
	 */
	getErrorMessage: function(o, name) {
		if (!o || !o.errorMsg) {
			return;
		}

		var errorMsg = o.errorMsg,
			item = null;
		for (var i = 0, c = errorMsg.length; i < c; i++) {
			item = errorMsg[i];
			if (item.name === name) {
				return item.message;
			}
		}
	}
	 
};

return FormUtil;
		
});
