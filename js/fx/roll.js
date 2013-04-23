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
	 *	active		active时样式 fx-roll-active
	 *	item		item选择器 默认为 li
	 *	delay		轮播间隔时间
	 *	duration	动画时间
	 *	easing		动画效果
	 */
	defaultOptions: {
		body: '.fx-roll-body',
		active: 'fx-roll-active',
		item: 'li',
		stopOnHover: true,
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
			log.error('invalid roll body');
			return;
		}
		this.body = body;

		this._prepare();	
		this._handle();
		this.start();
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
		if (this.options.stopOnHover) {
			this.element.on('mouseenter', $.proxy(this, 'stop'));
			this.element.on('mouseleave', $.proxy(this, 'start'));
		}
	},

	start: function() {
		if (this.active) {
			return;	
		}

		log.info('start');
		this.active = true;	
		this.element.addClass(this.options.active);
		this.body.stop();
		this._play();
	},

	stop: function() {
		if (!this.active) {
			return;
		}

		log.info('stop');
		this.active = false;
		clearTimeout(this.timer);
		this.body.stop();
		this.element.removeClass(this.options.active);
	},

	_play: function() {
		log.info('play');

		var self = this,
			items = this._getItems(),

			first = items.eq(0),
			second = items.eq(1),
			width = second.offset().left - first.offset().left;

		this.body.animate({
			left: '-' + width
		}, {
			duration: this._fixDuration(this.options.duration, width, this.body.css('left')),
			easing: this.options.easing,
			complete: function() {
				self.body.append(first);	
				self.body.css('left', '0');
				
				if (!self.active) {
					return;
				}

				if (self.options.delay) {
					self.timer = setTimeout($.proxy(self, '_play'), self.options.delay);
				} else {
					self._play();
				}

			}
		});
	},

	_fixDuration: function(duration, width, left) {
		var map = {
			fast: 200,
			slow: 600
		};
		duration = typeof duration === 'string' ? map[duration] : duration;
		duration = duration || 400;

		var ratio = (width + (parseInt(left, 10) || 0)) / width;
		duration = Math.floor(duration * ratio);
		log.info('fix duration to:' + duration);
		return duration;
	}
	
});
		
});
