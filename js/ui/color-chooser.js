/**
 * 颜色选取框
 * 
 * @author qijun.weiqj
 */
define('ui.ColorChooser', 

['jQuery', 'Class', 'Log', 'http://assets.1688.com/css/ui/color-chooser.css'], 

function($, Class, Log) {


return Class({
	
	/**
	 * @ctor 构造一个ColorChooser
	 * @param {element} div 
	 * @param {object} options
	 *	- transparent	是否支持透明
	 *	- value			当前值
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
	 * 取得rgb颜色
	 * @return {array<r, g, b>}
	 */
	getRGBColor: function() {
		return this.color || [0, 0, 0];
	},

	/**
	 * 取得16进制颜色
	 */
	getColor: function() {
		if (this.options.transparent && 
				this.nowColorPanel.hasClass('color-transparent')) {
			return 'transparent';
		}
		return '#' + this._colorToHex(this.getRGBColor());
	},

	/**
	 * 设置颜色
	 * @param {string|array<r, g, b>} color
	 */
	setValue: function(color) {
		if (typeof color === 'string') {
			color = this._hexToColor(color);
		}

		this._setValue(color);
	},

	/**
	 * 关闭
	 */
	close: function() {
		this.panel && this.panel.remove();	
		this.panel = null;
		this.div.data('colorChooser', false);
	},

	/**
	 * 取得面版节点
	 */
	getPanel: function() {
		return this.panel;
	},

	/**
	 * 设置当前颜色值, 不操作colorBar和colorPanel
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
	 * 创建面版容器
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
	 * 渲染colorBar
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
	 * colorBar变化规则
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
	 * 渲染colorPanel, 右上角颜色为color
	 */
	_renderColorPanel: function(color) {
		var html = [],
			box = $('div.box', this.colorPanel),
			count = 16,	 // 16 x 16 
			leftBar = this._createColorList([255, 255, 255], [0, 0, 0], count), // 左边一条颜色列表
			rightBar = this._createColorList(color, [0, 0, 0], count);			// 右边一条颜色列表

		leftBar.push([0, 0, 0]);	// 补全最后一个颜色
		rightBar.push([0, 0, 0]);
		
		// 生成每一行颜色列表	
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
	 * 处理colorBar事件
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
	 * 处理colorPanel事件
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
	 * 处理透明事件
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
	 * 生成颜色列表html
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
	 * 生成两个颜色的过渡颜色列表, 个数为count
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
	 * 取得指定颜色的主色调
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
	 * 10进制转成16进制, 大写 2位
	 */
	_dec2Hex: function(n) {
		var n = (n - 0).toString(16).toUpperCase();
		return n.length === 1 ? '0' + n : n;
	},
	
	/**
	 * 数组颜色[r, g, b] 转成16进制
	 */
	_colorToHex: function(color) {
		return this._dec2Hex(color[0]) + this._dec2Hex(color[1]) + this._dec2Hex(color[2]);	
	},
	
	/**
	 * 16进制颜色转成数组[r, g, b]
	 */
	_hexToColor: function(hex) {
		hex= hex.replace(/^#/, '');

		var r = parseInt(hex.substr(0, 2) || '0', 16),
			g = parseInt(hex.substr(2, 2) || '0', 16),
			b = parseInt(hex.substr(4, 2) || '0', 16);

		return [r, g, b];
	},

	
	/**
	 * 颜色面版结构
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
					<div class="now-label">新的</div>\
					<div class="box">\
						<div class="now-color"></div>\
						<div class="last-color"></div>\
					</div>\
					<div class="last-label">当前</div>\
				</div>\
				<div class="trans-part fd-hide">\
					<div class="trans-label">透明</div>\
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
				<a href="#" class="action-btn confirm">确定</a>\
				<a href="#" class="action-btn cancel">取消</a>\
			</div>\
		</div>\
		</div>'

});	


});
