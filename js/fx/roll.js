/**
 * 轮播功能
 * @author qijun.weiqj
 */
define('fx.Roll', ['jQuery', 'ui.Widget', 'Log'], function($, Widget, Log) {

var log = new Log('fx.Roll');

return new Widget({

	/**
	 *	count		item数量 可选, 默认会从宽度和item数量推算出个数	
	 *	body		内容选择器 默认为 fx-roll-body
	 *	item		item选择器 默认为 li
	 *	delay		轮播间隔时间
	 *	duration	动画时间
	 */
	defaultOptions: {
		body: '.fx-roll-body',
		item: 'li',
		delay: 3000
	},

	init: function() {	
		// 数量不足时不轮播
		var count = this.options.count || this._getCount();
		if (!count || this._getItems().length <= count) {
			return;
		}
		
		var body = $(this.options.body, this.element);
		if (!body.length) {
			log.error('invalid fx-roll-body');
			return;
		}
		this.body = body;

		this._prepare();	
		this._handle();
		this._play();
	},

	_getItems: function() {
		return $(this.options.item, this.element);
	},

	_getCount: function() {
		var items = this._getItems(),
			off1 = items.eq(0).offset(),
			off2 = items.eq(1).offset(),
			width = 0;

		if (off1 && off2) {
			width = off2.left - off1.left;
		}

		return width > 0 ? parseInt(this.element.width() / width, 10) : 0;
	},

	_prepare: function() {
		this.body.css('position', 'relative');
	},

	_handle: function() {
		var self = this;
		this.element.on('mouseenter', function() {
			self.isHover = true;
			self.element.addClass('fx-roll-hover');
		});
		this.element.on('mouseleave', function() {
			self.isHover = false;
			self.element.removeClass('fx-roll-hover');
		});
	},

	_play: function() {
		if (this.isHover) {
			this._delay();
			return;
		}

		var self = this,
			duration = this.options.duration,

			items = this._getItems(),

			first = items.eq(0),
			second = items.eq(1),
			left = second.offset().left - first.offset().left;

		this.body.animate({
			left: '-' + left
		}, duration, function() {
			self.body.append(first);
			self.body.css({
				left: 0
			});

			self._delay();
		})
	},

	_delay: function() {
		var self = this;
		setTimeout(function() {
			self._play();	
		}, this.options.delay);
	}
	
});
		
});
