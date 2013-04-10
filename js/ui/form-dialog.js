/**
 * 基于Hander的对话框
 * 将View和逻辑分离
 *
 * @author qijun.weiq
 */
define('ui.FormDialog', ['jQuery',  'Class', 'ui.Dialog'], 


function($, Class, Dialog) {


var FormDialog = new Class(Dialog, {
	
	/**
	 * 需要提供config.handler来管理对话框逻辑
	 *  {
	 *		init: function(dialog),
	 *		validate: function(dialog),
	 *		submit: function(dialog), 
	 *		cancel: function(dialog),
	 *		beforeClose: function(dialog)
	 *  }
	 */ 
	$prepare: function(config) {
		if (!config.handler) {
			throw 'form handler is not specified';
		}

		config.buttons = config.buttons || 
				[{ name: 'submit', text: '确定' }, { name: 'cancel', text: '取消' }];

		config.contentSuccess = $.proxy(this, '_contentSuccess');
		config.submit = $.proxy(this, '_submit');
		config.cancel = $.proxy(this, '_cancel');

		config.beforeClose = $.proxy(this, '_beforeClose');

		this.handler = config.handler;

		return config;
	},

	_contentSuccess: function() {
		this._call('init');
	},

	_submit: function() {
		var handler = this.handler;
		if (handler.validate && !handler.validate()) {
			return false;
		}
		return this._call('submit');
	},

	_cancel: function() {
		if (this._call('cancel') !== false) {
			this.close();
		}
	},

	_beforeClose: function() {
		return this._call('beforeClose');
	},

	_call: function(name) {
		var handler = this.handler;	
		return handler && handler[name] && handler[name](this);
	}
  
});
//~

FormDialog.open = function(config) {
	return new FormDialog(config);	
};


return FormDialog;

		
});
