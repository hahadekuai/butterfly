/**
 * 即时编辑
 * @author qijun.weiqj
 */
define('ui.InplaceEditor', ['jQuery', 'Log', 'Class'], 
		function($, Log, Class) {

'use strict';

var log = new Log('ui.InplaceEditor');

var InplaceEditor = new Class({

	init: function(element, options) {
		this.element = $(element);
		this.options = options || {};

		this._handle();	
	},

	_handle: function() {
		var self = this;
		this.options.event &&
		this.element.on(this.options.event, function() {
			InplaceEditor.open($(this), self.options);
		});
	},

	open: function(index) {
		var elm = this.element.eq(index || 0);
		InplaceEditor.open(elm, this.options);
	},

	isActive: function(index) {
		var elm = this.element.eq(index || 0);
		InplaceEditor.isActive(elm);
	}

});
//~

$.extend(InplaceEditor, {
	
	open: function(elm, options) {
		log.info('open');

		elm = $(elm).eq(0);
		if (elm.length !== 1) {
			log.error('invalid element');
			return;
		}

		if (this.isActive(elm)) {
			log.info('already active, break');
			return;
		}

		var data = this._data(elm);
		data.active = true;

		if (options) {
			data.options = options;
		}

		if (!data.options) {
			log.error('no options set');
			return;
		}

		this._setup(elm);
		this._open(elm);
	},

	isActive: function(elm) {
		var data = this._data($(elm));
		return !!data.active;
	},

	_data: function(elm) {
		var data = elm.data('inplaceEditor');
		if (!data) {
			data = {};
			elm.data('inplaceEditor', data);
		}
		return data;
	},

	_options: function(elm) {
		return this._data(elm).options;
	},

	_setup: function(elm) {
		var cn = 'ui-ineditor-label',
			label = this._getLabel(elm);
		if (label.length === 0) {
			label = elm.find('div,span').eq(0);
			label.length ? label.addClass(cn) :
					elm.wrapInner('<span class="' + cn + '"></span>');
		}
	},

	_open: function(elm) {
		var options = this._options(elm),
			label = this._getLabel(elm),
			value = label.text(),
			type = options.type || 'text';

		var Editor = typeof type === 'function' ? type : Editors[type];
		if (!Editor) {
			log.error('invalid editor');
			return;
		}
		Editor({
			element: elm,
			label: label,
			value: value,
			submit: $.proxy(this, '_submit', elm),
			cancel: $.proxy(this, '_cancel', elm),
			options: options
		});
	},

	_submit: function(elm, value, callback) {
		var self = this,
			called = false;

		var fn = function(o) {
			if (called) {
				return;
			}
			called = true;
			
			o.success && self._text(elm, value);
			
			var complete = o.success || o.cancel,
				data = self._data(elm);
			data.active = !complete;
			callback(complete);
		};
		
		// 允许用户通过回调或返回值通知提交结果 
		var opts = this._options(elm),
			o = opts.submit ? opts.submit(value, fn) : { success: true };
		o && fn(o);
	},

	_text: function(elm, value) {
		var label = this._getLabel(elm);
		label.text(value);
	},

	_cancel: function(elm) {
		var data = this._data(elm);
		data.active = false;
	},

	_getLabel: function(elm) {
		return $('.ui-ineditor-label', elm);
	}

});
//~

var Editors = {};

var Text = new Class({
	/**
	 * options
	 *	- editorClass
	 *	- editorAttr
	 *	- forceSubmit
	 *	- cancelOnEmpty
	 */
	init: function(config) {
		this.config = config;
		this.label = config.label;
		this.value = config.value;
		this.options = config.options;

		this._create();
		this._handle();
	},

	_create: function() {
		var editor = $('<input>', { type: 'text' }),
			cn = this.options.editorClass,
			attr = this.options.editorAttr;

		editor.val(this.value).addClass('ui-ineditor-text');
		cn && editor.addClass(cn);
		attr && editor.attr(attr);
		
		this.label.hide().after(editor);
		editor.trigger('focus');

		this.editor = editor;
	},

	_handle: function() {
		var self = this;
		this.editor.on('blur', function() {
			var value = $.trim($(this).val());
			if (!self.options.forceSubmit && self.value === value ||
					self.options.cancelOnEmpty && !value) {
				self.config.cancel();
				return;
			}

			self.config.submit(value, function(complete) {
				if (complete) {
					self.editor.remove();
					self.label.show();
				}
			});
		});
	}


});
Editors.text = function(config) {
	return new Text(config);
};
//~test


InplaceEditor.Editors = Editors;

return InplaceEditor;

});
