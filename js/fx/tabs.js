/**
 * Tabs���
 * @author qijun.weiqj
 */
define('fx.Tabs', ['jQuery', 'Log', 'ui.Widget'], 

function($, Log, Widget) {


var log = new Log('fx.Tabs');


var Tabs = Widget({
	
	/**
	 * ��ʼ��һ��Tab
	 * @param {jquery} div		dom�ڵ�
	 * @param {object} options	���ò���
	 *  - nav: '.fx-tab-nav li'		navѡ����
	 *  - pane: '.fx-tab-pane'		paneѡ����
	 *  - active: 'active'			active className
	 *  - disabled: 'disabled'		disabled className
	 *  - prev: '.fx-prev'			��һҳѡ����
	 *  - next: '.fx-next'			��һҳѡ����
	 *
	 *  - index:					��ʼѡ��ҳ
	 *
	 *  - event						�����¼�, Ĭ��Ϊ mouseenter
	 *
	 *  - interval					�Զ��ֲ�ʱ�����ʱ��, Ĭ��3s
	 *
	 *  - before {function}			�л�ǰ�ص�
	 *  - switch {function}		�л���ص�
	 *
	 *	- effect				Ч��
	 *		���õ��� default, updown, leftright, fade
	 *	- duration				����ʱ��
	 *
	 *	- autoSwitch			�Զ��л�����, Ĭ�ϲ��л�
	 *		liner					˳�򲥷�
	 *		random					�������
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
	 * ��ʼ���л���Ϊ
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
	 * �����л��¼�
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
	 * �л���ָ��ҳ
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
	 * �����Զ��л�
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
 * Ч��
 */
Tabs.Effect = {
	'default':  function(o, callback) {
		o.panes.hide()
		o.panes.eq(o.index).show();

		callback();
	},

	/**
	 * ���¹���
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
	 * ���ҹ���
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
	 * ����
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
			
			// �µ��Ƶ�������, ��������ʾ����
			now.css({
				'z-index': 2	
			}).stop(true).animate({
				opacity: 1
			}, o.options.duration, function() {
				d.resolve();	
			});

			// �ϵ��Ƶ��ڶ���, ����������
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
 * �Զ��ֲ�����
 */
Tabs.AutoSwitch = {

	/**
	 * ˳�򲥷�
	 */
	'liner': function(now, length) {
		now++;
		return now % length;		
	},

	/**
	 * �������
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
