/**
 * 浮出效果, 移出后关闭
 * @author qijun.weiqj
 */
define('fx.Popup', ['jQuery', 'ui.Widget'], function($, Widget) {
	
var Popup = new Widget({

	defaultOptions: {
		trigger: '.fx-popup-trigger',		// 触发节点
		//showTrigger: ,					// 显示触发节点选择器，默认和trigger相同
		//hideTrigger: ,					// 隐藏触发节点选择器，默认和trigger相同
		showEvent: 'mouseenter',			// 显示事件
		hideEvent: 'mouseleave',			// 关闭事件

		body: '.fx-popup-body',				// 内容节点选择器
		effect: 'default',					// 浮出效果
		active: 'fx-popup-active',			// 显示时具有的className

		showDelay: 0,						// 延迟打开
		hideDelay: 0						// 延迟关闭
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
