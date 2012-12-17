/**
 * Tabs组件
 * @author qijun.weiqj
 */
define('fx.Tabs', ['jQuery', 'Log', 'ui.Widget'], 

function($, Log, Widget) {


var log = new Log('fx.Tabs');


var Tabs = Widget({
	
	/**
	 * 初始化一个Tab
	 * @param {jquery} div		dom节点
	 * @param {object} options	配置参数
	 *  - nav: '.fx-tab-nav li'		nav选择器
	 *  - pane: '.fx-tab-pane'		pane选择器
	 *  - active: 'active'			active className
	 *  - disabled: 'disabled'		disabled className
	 *  - prev: '.fx-prev'			上一页选择器
	 *  - next: '.fx-next'			下一页选择器
	 *
	 *  - index:					初始选中页
	 *
	 *  - event						触发事件, 默认为 mouseenter
	 *
	 *  - interval					自动轮播时，间隔时间, 默认3s
	 *
	 *  - before {function}			切换前回调
	 *  - switch {function}		切换后回调
	 *
	 *	- effect				效果
	 *		内置的有 default, updown, leftright, fade
	 *	- duration				动画时间
	 *
	 *	- autoSwitch			自动切换类型, 默认不切换
	 *		liner					顺序播放
	 *		random					随机播放
	 */	
	defaultOptions: {
		nav: '.fx-tab-nav li',
		pane: '.fx-tab-pane',
		effect: 'default',
		active: 'active',
		disabled: 'disabled',
		prev: '.fx-prev',
		next: '.fx-next',
		event: 'mouseenter',
		interval: 3000
	},

	init: function() {
		var div = this.element,
			options = this.options;

		this.navs = $(options.nav, div);
		this.prev = $(options.prev, div);
		this.next = $(options.next, div);

		this.panes = $(options.pane, div);
		
		this.index = -1;
		if (!this.panes.length) {
			return;
		}

		this._initEffect();	
		this._handleSwitch();
		this._handleAutoSwitch();

		this.switchTo(options.index || 0);
	},

	/**
	 * 初始化切换行为
	 */
	_initEffect: function() {
		var effect = this.options.effect;
		if (typeof effect === 'string') {
			this.element.addClass('fx-tab-effect-' + effect);
		}
		effect = this._get('Effect', effect);
		effect = typeof effect === 'function' ? { show: effect } : effect;		
		
		effect.setup && effect.setup(this);

		this.effect = effect;
	},

	/**
	 * 处理切换事件
	 */
	_handleSwitch: function() {
		var self = this,
			options = this.options;

		this.element.on(options.event, options.nav, function(e) {
			e.preventDefault();
			var index = self.navs.index(this);
			self.switchTo(index);
		});

		this.element.on(options.event, options.prev, function(e) {
			e.preventDefault();	
			var index = self.index - 1;
			index >= 0 && self.switchTo(index);
		});

		this.element.on(options.event, options.next, function(e) {
			e.preventDefault();
			var index = self.index + 1;
			index < self.panes.length && self.switchTo(index);
		});
	},

	/**
	 * 切换到指定页
	 */
	switchTo: function(index, callback) {
		log.info('switch to ' + index);

		if (index === this.index) {
			log.info('index === lastIndex, return');
			return;
		}

		var self = this,
			options = this.options,
			data = {
				lastIndex: this.index, 
				index: index,
				
				element: this.element,
				options: options,
				
				navs: this.navs,
				panes: this.panes
			};

		if (this.triggerHandler('before', data) === false) {
			log.info('before return false, break');
			return;
		}
		
		this.navs.eq(this.index).removeClass(options.active);
		this.navs.eq(index).addClass(options.active);
		this.index = index;

		this.effect.show(data, function() {
			self._afterSwitch(data);
			callback && callback();
			self.trigger('switch', data);
		});
	},

	_afterSwitch: function(data) {
		var options = this.options,
			panes = this.panes;

		panes.eq(data.lastIndex).removeClass(options.active);
		panes.eq(data.index).addClass(options.active);

		this.prev.toggleClass(options.disabled, data.index === 0);
		this.next.toggleClass(options.disabled, data.index === panes.length - 1);
	},

	/**
	 * 处理自动切换
	 */
	_handleAutoSwitch: function() {
		var options = this.options;
		if (!options.autoSwitch) {
			return;
		}

		var self = this,
			autoSwitch = this._get('AutoSwitch', options.autoSwitch),
			interval = parseInt(options.interval, 10),
			stop = false;

		this.element.on('mouseenter', function() {
			stop = true;	
		}).on('mouseleave', function() {
			stop = false;	
		});

		var fn = function() {
			if (stop) {
				setTimeout(fn, interval);
				return;
			}

			var index = autoSwitch(self.index, self.panes.length);
			self.switchTo(index, function() {
				setTimeout(fn, interval);
			});
		};

		setTimeout(fn, interval);
	},

	_get: function(type, name) {
		return this.getConfigObject(type, name);
	}
	
});
//~ Tabs


/**
 * 效果
 */
Tabs.Effect = {
	'default':  function(o, callback) {
		o.panes.hide()
		o.panes.eq(o.index).show();

		callback();
	},

	/**
	 * 上下滚动
	 */
	'updown': function(o, callback) {
		var now = o.panes.eq(o.index),
			content = now.parent();
			
			contentTop = content.offset().top,
			nowTop = now.offset().top,

		content.css('position', 'relative');
		content.stop(true).animate({
			top: contentTop - nowTop
		}, o.options.duration, callback);	
	},

	/**
	 * 左右滚动
	 */
	'leftright': {
		setup: function(o) {
			var panes = o.panes,
				width = o.element.width() * panes.length + 100,
				content = panes.eq(0).parent();
			
			content.addClass('fd-clr').width(width);
			panes.css('float', 'left');
		},

		show: function(o, callback) {
			var now = o.panes.eq(o.index),
				content = now.parent(),
				
				contentLeft = content.offset().left,
				nowLeft = now.offset().left;

			content.css('position', 'relative');
			content.stop(true).animate({
				left: contentLeft - nowLeft
			}, o.options.duration, callback);
		}
	},
	
	/**
	 * 渐变
	 */
	'fade': {
		setup: function(o) {
			var panes = o.panes,
				content = panes.eq(0).parent();

			content.css('position', 'relative');
			panes.css({
				position: 'absolute',
				left: 0,
				top: 0
			});
		},

		show: function(o, callback) {
			var last = o.lastIndex === -1 ? $() : o.panes.eq(o.lastIndex),
				now = o.panes.eq(o.index),
				d = $.Deferred();

			o.panes.not(last).css('opacity', 0);
			
			// 新的移到最上面, 再慢慢显示出来
			now.css({
				'z-index': 2	
			}).stop(true).animate({
				opacity: 1
			}, o.options.duration, function() {
				d.resolve();	
			});

			// 老的移到第二层, 再慢慢淡出
			last.css('z-index', 1).stop(true).animate({
				opacity: 0
			}, o.options.duration, function() {
				last.css('z-index', '');
				d.resolve();	
			});

			d.done(callback);
		}
	}
	
};
//~ Effect


/**
 * 自动轮播类型
 */
Tabs.AutoSwitch = {

	/**
	 * 顺序播放
	 */
	'liner': function(now, length) {
		now++;
		return now % length;		
	},

	/**
	 * 随机播放
	 */
	'random': function(now, length) {
		var index = -1;
		while (now === 
			(index = Math.floor(Math.random() * length)));
		return index;
	}
};
//~ AutoSwitch


return Tabs;

		
});
