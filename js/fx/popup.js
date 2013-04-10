/**
 * ����Ч��, �Ƴ���ر�
 * @author qijun.weiqj
 */
define('fx.Popup', ['jQuery', 'ui.Widget'], function($, Widget) {
	
var Popup = new Widget({

	defaultOptions: {
		trigger: '.fx-popup-trigger',		// �����ڵ�
		//showTrigger: ,					// ��ʾ�����ڵ�ѡ������Ĭ�Ϻ�trigger��ͬ
		//hideTrigger: ,					// ���ش����ڵ�ѡ������Ĭ�Ϻ�trigger��ͬ
		showEvent: 'mouseenter',			// ��ʾ�¼�
		hideEvent: 'mouseleave',			// �ر��¼�

		body: '.fx-popup-body',				// ���ݽڵ�ѡ����
		effect: 'default',					// ����Ч��
		active: 'fx-popup-active',			// ��ʾʱ���е�className

		showDelay: 0,						// �ӳٴ�
		hideDelay: 0						// �ӳٹر�
	},
	
	init: function() {
		this.effect = this.getConfigObject('Effect', this.options.effect);
		this._handle();
	},

	_handle: function() {
		var options = this.options,
			showHandler = this._delay($.proxy(this, 'show'), options.showDelay),
			hideHandler = this._delay($.proxy(this, 'hide'), options.hideDelay);
		
		this.element.on(options.showEvent, options.showTrigger || options.trigger, showHandler);
		this.element.on(options.hideEvent, options.hideTrigger || options.trigger, hideHandler);
	},

	_delay: function(action, delay) {
		var self = this;
		return delay ? function() {
			self._clear();
			self._timer = setTimeout(action, delay);
		} : function() {
			self._clear();	
			action();
		};
	},

	_clear: function() {
		this._timer && clearTimeout(this._timer);
		this._timer = null;
	},

	show: function() {
		if (this.isShow) {
			return;
		}
		this.isShow = true;

		var self = this,
			body = $(this.options.body, this.element);
		this.effect.show(body, function() {
			self.element.addClass(self.options.active);
			self.trigger('show');
		});
	},

	hide: function() {
		if (!this.isShow) {
			return;
		}
		this.isShow = false;
		
		var self = this,
			body = $(this.options.body, this.element);
		this.effect.hide(body, function() {
			self.element.removeClass(self.options.active);
			self.trigger('hide');
		});
	},

	toggle: function() {
		this.isShow ? this.hide() : this.show();	
	}

});
//~

Popup.Effect = {
	'default': {
		show: function(elm, callback) {
			elm.show();
			callback();
		},
		hide: function(elm, callback) {
			elm.hide();	
			callback();
		}
	}
			
};

return Popup;
		
});
