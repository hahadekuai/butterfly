/**
 * ��ɫѡȡ��
 * 
 * @author qijun.weiqj
 */
define('ui.ColorChooser', 

['jQuery', 'Class', 'Log', 'http://assets.1688.com/css/ui/color-chooser.css'], 

function($, Class, Log) {


return Class({
	
	/**
	 * @ctor ����һ��ColorChooser
	 * @param {element} div 
	 * @param {object} options
	 *	- transparent	�Ƿ�֧��͸��
	 *	- value			��ǰֵ
	 */
	init: function(div, options) {
		options = options || {}

		this.div = $(div);

		if (this.div.data('colorChooser')) {
			return;
		}
		this.div.data('colorChooser', true);

		this.options = options;

		var panel = this._createPanel();
		this.panel = panel;

		this.colorPanel = $('div.color-panel', panel);
		this.colorBar = $('div.color-bar', panel);

		this.nowColorPanel = $('div.now-color', panel);
		this.lastColorPanel = $('div.last-color', panel);

		this.transPart = $('div.trans-part', panel);
		this.transTicks = $('div.trans-ticks', panel);

		this.valueText = $('input.value-text', panel);;

		this._initColorBar();

		this._handleColorBar();
		this._handleColorPanel();
		this._handleTransPanel();
		this._handleValueText();
		this._handleAction();
		
		this._setInitValue();
	},

	_setInitValue: function() {
		var options = this.options;

		if (options.transparent) {
			this.transPart.removeClass('fd-hide');
		}

		if (options.value) {
			if (options.value === 'transparent') {
				this.nowColorPanel.addClass('color-transparent');
				this.lastColorPanel.addClass('color-transparent');
			} else {
				this.setValue(options.value);
				this.lastColorPanel.css('background-color', this.getColor());
			}
			this._renderColorPanel(this._getMainColor(this.getRGBColor()));
		} else {
			this._renderColorPanel([255, 0, 0]);
		}
	},
	
	/**
	 * ȡ��rgb��ɫ
	 * @return {array<r, g, b>}
	 */
	getRGBColor: function() {
		return this.color || [0, 0, 0];
	},

	/**
	 * ȡ��16������ɫ
	 */
	getColor: function() {
		if (this.options.transparent && 
				this.nowColorPanel.hasClass('color-transparent')) {
			return 'transparent';
		}
		return '#' + this._colorToHex(this.getRGBColor());
	},

	/**
	 * ������ɫ
	 * @param {string|array<r, g, b>} color
	 */
	setValue: function(color) {
		if (typeof color === 'string') {
			color = this._hexToColor(color);
		}

		this._setValue(color);
	},

	/**
	 * �ر�
	 */
	close: function() {
		this.panel && this.panel.remove();	
		this.panel = null;
		this.div.data('colorChooser', false);
	},

	/**
	 * ȡ�����ڵ�
	 */
	getPanel: function() {
		return this.panel;
	},

	/**
	 * ���õ�ǰ��ɫֵ, ������colorBar��colorPanel
	 */
	_setValue: function(color, flag) {
		this.color = color;	
		
		var hex = this._colorToHex(color);

		flag || this.valueText.val(hex);

		if (this.options.transparent) {
			this.nowColorPanel.removeClass('color-transparent');
		}
		this.nowColorPanel.css('background-color', '#' + hex);
	},
	
	/**
	 * �����������
	 */
	_createPanel: function() {
		var self = this,
			options = this.options,
			panel = $(this._template),

			pos = this.div.offset(),
			maxLeft = $(window).width() - this.div.width() - 20,
			left = maxLeft < pos.left ? maxLeft : pos.left;

		panel.css({
			left: left,
			top: pos.top
		});

		options.className && panel.addClass(options.className);

		panel.appendTo('body');

		return panel;
	},

	/**
	 * ��ȾcolorBar
	 */
	_initColorBar: function() {
		var html = [],
			box = $('div.box', this.colorBar),
			last = this._map[0],
			now = null;

		for (var i = 1, c = this._map.length; i < c; i++) {
			now = this._map[i];
			html.push(this._createItems(last, now, 10));
			last = now;
		}

		html.push(this._createItem(now));

		box.html(html.join(''));
		$('div:last-child', box).addClass('last');
	},

	/**
	 * colorBar�仯����
	 */
	_map: [
		[255, 0, 0],
		[255, 0, 255],
		[0, 0, 255],
		[0, 255, 255],
		[0, 255, 0],
		[255, 255, 0],
		[255, 0, 0]
	],
	
	/**
	 * ��ȾcolorPanel, ���Ͻ���ɫΪcolor
	 */
	_renderColorPanel: function(color) {
		var html = [],
			box = $('div.box', this.colorPanel),
			count = 16,	 // 16 x 16 
			leftBar = this._createColorList([255, 255, 255], [0, 0, 0], count), // ���һ����ɫ�б�
			rightBar = this._createColorList(color, [0, 0, 0], count);			// �ұ�һ����ɫ�б�

		leftBar.push([0, 0, 0]);	// ��ȫ���һ����ɫ
		rightBar.push([0, 0, 0]);
		
		// ����ÿһ����ɫ�б�	
		for (var i = 0, c = leftBar.length; i < c; i++) {
			var left = leftBar[i],
				right = rightBar[i];
			
			html.push('<div class="row">');
			html.push(this._createItems(left, right, count));
			html.push(this._createItem(right));
			html.push('</div>');
		}

		box.html(html.join(''));
		$('div:last-child', box).addClass('last');
	},
	
	/**
	 * ����colorBar�¼�
	 */
	_handleColorBar: function() {
		var self = this;

		this.colorBar.on('click', 'div.item', function() {
			var item = $(this),
				color = item.data('color');
			self._renderColorPanel(color);

			self._setValue(color);
		});
	},
	
	/**
	 * ����colorPanel�¼�
	 */
	_handleColorPanel: function() {
		var self = this;	

		this.colorPanel.on('click', 'div.item', function() {
			var item = $(this),	
				color = item.data('color');

			self._setValue(color);
		});
	},

	/**
	 * ����͸���¼�
	 */
	_handleTransPanel: function() {
		var self = this;

		this.transTicks.on('click', function(e) {
			e.preventDefault();	
			self.nowColorPanel.css('background-color', '').addClass('color-transparent');
			self.valueText.val('');
		});

	},
	
	_handleValueText: function() {
		var self = this,
			pattern = /^[0-9a-f]{0,6}$/i,
			text = this.valueText;

		text.on('keyup blur', function() {
			var last = text.data('lastValue'),
				value = $.trim(text.val()),
				color = null;
			
			if (pattern.test(value)) {
				text.data('lastValue', value);

				color = self._hexToColor(value);
				self._setValue(color, true);
				self._renderColorPanel(self._getMainColor(color));
			} else {
				text.val(last);
			}
		});
	},

	_handleAction: function() {
		var self = this,
			options = this.options;

		$('a.confirm', this.panel).on('click', function(e) {
			e.preventDefault();
			self.close();
			options.confirm && options.confirm({
				color: self.getColor(), 
				rgb: self.getRGBColor()
			});
		});

		$('a.cancel', this.panel).on('click', function(e) {
			e.preventDefault();
			self.close();	
		});
	},
	
	/**
	 * ������ɫ�б�html
	 */
	_createItems: function(from, to, count) {
		var html = [],
			list = this._createColorList(from, to, count);
		
		for (var i = 0, c = list.length; i < c; i++) {
			html.push(this._createItem(list[i]));
		}

		return html.join('');
	},

	_createItem: function(color) {
		return '<div class="item" style="background-color: rgb(' + color.join(',') + ');" data-color="[' + color.join(',') + ']"></div>';
	},

	
	/**
	 * ����������ɫ�Ĺ�����ɫ�б�, ����Ϊcount
	 * @param {array<r, g, b>} from
	 * @param {array<r, g, b>} to
	 * @param {number} count
	 */	
	_createColorList: function(from, to, count) {
		var list = [],
			rStep = Math.round((to[0] - from[0] + 1) / count),
			gStep = Math.round((to[1] - from[1] + 1) / count),
			bStep = Math.round((to[2] - from[2] + 1) / count),

			r = from[0],
			g = from[1],
			b = from[2];
		
		for (var i = 0; i < count; i++) {
			list.push([r, g, b]);
			r += rStep;
			g += gStep;
			b += bStep;
		}

		return list;
	},

	/**
	 * ȡ��ָ����ɫ����ɫ��
	 */
	_getMainColor: function(color) {
		var cache = this._colorBarCache;
		if (!cache) {
			cache = [];

			var lis = $('div.item', this.colorBar);
			lis.each(function() {
				var color = $(this).data('color');
				cache.push(color);
			});

			this._colorBarCache = cache;
		}

		var ret = null,
			min = 1000;

		$.each(cache, function(index, item) {
			var now = Math.abs(item[0] - color[0]) + Math.abs(item[1] - color[1]) + Math.abs(item[2] - color[2]);
			if (now < min) {
				min = now;
				ret = item;
			}
		});

		return ret;
	},
	
	/**
	 * 10����ת��16����, ��д 2λ
	 */
	_dec2Hex: function(n) {
		var n = (n - 0).toString(16).toUpperCase();
		return n.length === 1 ? '0' + n : n;
	},
	
	/**
	 * ������ɫ[r, g, b] ת��16����
	 */
	_colorToHex: function(color) {
		return this._dec2Hex(color[0]) + this._dec2Hex(color[1]) + this._dec2Hex(color[2]);	
	},
	
	/**
	 * 16������ɫת������[r, g, b]
	 */
	_hexToColor: function(hex) {
		hex= hex.replace(/^#/, '');

		var r = parseInt(hex.substr(0, 2) || '0', 16),
			g = parseInt(hex.substr(2, 2) || '0', 16),
			b = parseInt(hex.substr(4, 2) || '0', 16);

		return [r, g, b];
	},

	
	/**
	 * ��ɫ���ṹ
	 */
	_template:
		'<div class="widget-color-chooser-container">\
		<div class="widget-color-chooser">\
			<div class="color-panel">\
				<div class="box"></div>\
				<div class="pointer"></div>\
			</div>\
			<div class="color-bar">\
				<div class="box"></div>\
				<div class="pointer"></div>\
			</div>\
			<div class="indicator-panel">\
				<div class="color-indicator">\
					<div class="now-label">�µ�</div>\
					<div class="box">\
						<div class="now-color"></div>\
						<div class="last-color"></div>\
					</div>\
					<div class="last-label">��ǰ</div>\
				</div>\
				<div class="trans-part fd-hide">\
					<div class="trans-label">͸��</div>\
					<div class="trans-ticks"></div>\
				</div>\
				<div class="value-indicator">\
					<span class="unit">#</span>\
					<div class="box">\
						<input type="text" class="value-text" maxlength="6" />\
					</div>\
				</div>\
			</div>\
			<div class="action-bar">\
				<a href="#" class="action-btn confirm">ȷ��</a>\
				<a href="#" class="action-btn cancel">ȡ��</a>\
			</div>\
		</div>\
		</div>'

});	


});
