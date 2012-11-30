/**
 * 浮出效果, 移出后关闭
 * @author qijun.weiqj
 */
define('fx.Popup', ['jQuery', 'ui.Widget'], function($, Widget) {
	
return new Widget({

	defaultOptions: {
		event: 'mouseenter',		// 触发浮出效果事件
		trigger: 'popup-trigger',	// 触发节点选择器
		content: 'popup-content',	// 内容节点选择器
		delay: 0,					// 延迟打开
		delayForHide: 300			// 延迟关闭
	},
	
	init: function() {
		this._handleShow();
		this._handleHide();
	},

	_handleShow: function() {
		var options = this.options,
			handler = this._delay($.proxy(this, 'show'), options.delay);
		
		this.element.on(options.event, options.trigger, handler);
	},

	_handleHide: function() {
		var options = this.options,
			handler = this._delay($.proxy(this, 'hide'), options.delayForHide);

		this.element.on('mouseleave', options.trigger, handler);

		// 移出内容区, 需要隐藏 
		this.element.on('mouseleave', options.content, handler);

		// 移进内容区, 清除隐藏
		this.element.on('mouseenter', options.content, $.proxy(this, '_clear'));
	},

	_delay: function(action, delay) {
		var self = this;
		return delay ? function() {
			self._clear();
			self._timer = setTimeout(action, delay);
		} : action;
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
		this.element.addClass('widget-popup-show');
		$(this.options.content, this.element).show();
	},

	hide: function() {
		if (!this.isShow) {
			return;
		}
		
		this.isShow = false;
		this.element.removeClass('widget-popup-show');
		$(this.options.content, this.element).hide();
	},

	toggle: function() {
		this.isShow ? this.hide() : this.show();	
	}

});
		
});
