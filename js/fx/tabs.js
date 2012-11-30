/**
 * Tabs���
 * @author qijun.weiqj
 */
define('fx.Tabs', ['jQuery', 'Class', 'Log'], 

function($, Class, Log) {


var log = new Log('fx.Tabs');


var Tabs = Class({
	
	/**
	 * ��ʼ��һ��Tab
	 * @param {jquery}			div dom�ڵ�
	 * @param {object} options	���ò���
	 *  - nav: 'ul.tab-nav li'				navѡ����
	 *  - pane: 'div.tab-pane,ul.tab-pane'	paneѡ����
	 *  - active: 'active'					active className
	 *
	 *  - index:				��ʼѡ��ҳ
	 *
	 *  - event					�����¼�, Ĭ��Ϊ mouseenter
	 *
	 *  - interval				�Զ��ֲ�ʱ�����ʱ��, Ĭ��3s
	 *
	 *  - before {function}		�л�ǰ�ص�
	 *  - onswitch {function}	�л���ص�
	 *
	 *	- effect				Ч��
	 *		���õ��� default, updown, leftright, fade
	 *
	 *	- autoSwitch			�Զ��л�����
	 *		default					�������Զ��л�
	 *		liner					˳�򲥷�
	 *		random					�������
	 */	
	init: function(div, options) {
		var self = this;

		this.div = $(div);
		options = $.extend({
			nav: 'ul.tab-nav li',
			pane: 'div.tab-pane,ul.tab-pane',
			active: 'active'
		}, options);
		this.options = options;

		this._navs = $(options.nav, this.div);
		this._panes = $(options.pane, this.div);
		if (!this._panes.length) {
			return;
		}

		var effect = options.effect || 'default';
		if (typeof effect === 'string') {
			this.div.addClass('widgetx-tabs-effect-' + effect);
		}
		effect = this._get('Effect', effect);
		this._effect = typeof effect === 'function' ? { show: effect } : effect;

		this._autoSwitch = this._get('AutoSwitch', options.autoSwitch);
		
		this._handleSwitch();
		if (this._panes.length > 1 && this._autoSwitch) {
			this._handleAutoSwitch();
		}

		this.index = -1;

		this._effect.setup && this._effect.setup({
			navs: self._navs,
			panes: self._panes,
			container: self.div
		});
		this.switchTo(options.index || 0);

	},

	/**
	 * �л���ָ��ҳ
	 */
	switchTo: function(index, callback) {
		log.info('switch to ' + index);

		if (index === this.index) {
			log.info('same as last index');
			return;
		}

		var self = this,
			options = this.options,
			data = {
				lastIndex: this.index, 
				index: index,
				
				container: this.div,
				options: options,
				
				navs: this._navs,
				panes: this._panes
			};

		if (options.before && options.before(data) === false) {
			log.info('before return false, break');
			return;
		}
		
		this._navs.eq(this.index).removeClass(options.active);
		this._navs.eq(index).addClass(options.active);
		this.index = index;

		this._effect.show(data, function() {
			self._afterSwitch();
			callback && callback();
			options.onswitch && options.onswitch(data);	
		});
	},

	_afterSwitch: function() {
		if (this.options.lazy) {
			var pane = this._panes.eq(this.index);
			if (!pane.data('lazyLoadTrigger')) {
				site.trigger('ui-lazy-load-trigger', pane);
				pane.data('lazyLoadTrigger', true);
			}
		}
	},

	_handleSwitch: function() {
		var self = this,
			options = this.options,
			event = options.event || 'mouseenter';

		this.div.on(event, options.nav, function() {
			var index = self._navs.index(this);
			self.switchTo(index);
		});
	},

	_handleAutoSwitch: function() {
		var self = this,
			options = this.options,
			interval = parseInt(options.interval || 3000, 10),
			stop = false;

		this.div.on('mouseenter', function() {
			stop = true;	
		}).on('mouseleave', function() {
			stop = false;	
		});

		var fn = function() {
			if (stop) {
				setTimeout(fn, interval);
				return;
			}

			var index = self._autoSwitch(self.index, self._navs.length);
			self.switchTo(index, function() {
				setTimeout(fn, interval);
			});
		};

		setTimeout(fn, interval);
	},

	_get: function(type, name) {
		name = name || 'default';
		return typeof name === 'string' ? Tabs[type][name] : name;
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

	'updown': function(o, callback) {
		var now = o.panes.eq(o.index),
			content = now.parent();
			
			contentTop = content.offset().top,
			nowTop = now.offset().top,

		content.css('position', 'relative');
		content.stop(true).animate({
			top: contentTop - nowTop
		}, callback);	
	},

	'leftright': {
		setup: function(o) {
			o.panes.css('width', o.container.width() + 'px');
		},

		show: function(o, callback) {
			var now = o.panes.eq(o.index),
				content = now.parent(),
				
				contentLeft = content.offset().left,
				nowLeft = now.offset().left;

			content.css('position', 'relative');
			content.stop(true).animate({
				left: contentLeft - nowLeft
			}, callback);
		}
	},

	'fade': function(o, callback) {
		var last = o.lastIndex === -1 ? $() : o.panes.eq(o.lastIndex),
			now = o.panes.eq(o.index),
			d = $.Deferred();

		o.panes.not(last).css('opacity', 0);
		
		// �µ��Ƶ�������, ��������ʾ����
		now.css({
			'z-index': 2	
		}).stop(true).animate({
			'opacity': 1
		}, function() {
			d.resolve();	
		});

		// �ϵ��Ƶ��ڶ���, ����������
		last.css('z-index', 1).stop(true).animate({
			'opacity': 0	
		}, function() {
			last.css('z-index', '');
			d.resolve();	
		});

		d.then(callback);
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
