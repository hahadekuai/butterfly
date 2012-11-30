/**
 * 轮播功能
 * @author qijun.weiqj
 */
define('fx.Roll', ['jQuery', 'Class', 'Log'], function($, Class, Log) {

var log = new Log('fx.Roll');

return new Class({
	
	/**
	 * 构造一个Roll
	 * @param {jquery} div 
	 * @param options
	 *	- count		item数量 可选, 默认会从宽度和item数量推算出个数	
	 *	- contentSelector 内容选择器 .widgetx-roll-content
	 *	- itemSelector	item选择器 默认为 li
	 *	- speed		
	 *	- delay		默认为 3000, 即延迟3秒轮播
	 */
	init: function(div, options) {	
		this.div = $(div).eq(0);
		this.options = options || {};

		// 数量不足时不轮播
		var count = this.options.count || this._getCount();
		if (!count || this._getItems().length <= count) {
			return;
		}
		
		var contentSelector = this.options.contentSelector || '.widgetx-roll-content';
		this.content = $(contentSelector, this.div);

		this._prepare();	
		this._handle();
		this._play();
	},

	_getItems: function() {
		return $(this.options.selector || 'li', this.div);
	},

	_getCount: function() {
		var items = this._getItems(),
			off1 = items.eq(0).offset(),
			off2 = items.eq(1).offset(),
			width = 0;

		if (off1 && off2) {
			width = off2.left - off1.left;
		}

		return width > 0 ? parseInt(this.div.width() / width, 10) : 0;
	},

	_prepare: function() {
		this.content.css('position', 'relative');
	},

	_handle: function() {
		var self = this;
		this.div.on('mouseenter', function() {
			self.isHover = true;
			self.div.addClass('widgetx-roll-hover');
		});
		this.div.on('mouseleave', function() {
			self.isHover = false;
			self.div.removeClass('widgetx-roll-hover');
		});
	},

	_play: function() {
		if (this.isHover) {
			this._delay();
			return;
		}

		var self = this,
			items = this._getItems(),

			first = items.eq(0),
			second = items.eq(1),
			left = second.offset().left - first.offset().left;

		this.content.animate({
			left: '-' + left
		}, function() {
			self.content.append(first);
			self.content.css({
				left: 0
			});
			self._delay();
		})
	},

	_delay: function() {
		var self = this,
			options = this.options;
		setTimeout(function() {
			self._play();	
		}, options.delay || 3000);
	}
	
});
		
});
