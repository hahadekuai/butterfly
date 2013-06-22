/**
 * UI类工具方法
 * @author qijun.weiq
 */
define('ui.UI', ['jQuery', 'util.Util'], function($, Util) {

var UI = {
	
	bgiframe: function(op) {
		$.use('ui-core', $.proxy(this, '_bgiframe', op));
	},

	_bgiframe: function(op) {
		$('body').bgiframe(op ? { 
			zIndex: 199, 
			force: true 
		} : 'close');
	}
	 
};


/**
 * 等比例缩放图片使其最大边不超过size, 长宽都小于size的图片不进行缩放
 * @param {selector|element} selector 需要缩放的图片
 * @param {number | options} options|size 最长边大小
 * 	options
 * 	 - width
 *   - height
 *   - force
 *   - defaultImage
 */
UI.resizeImage = (function() {
	return function(selector, options/*size*/, defaultImage) {
		if (!$.isPlainObject(options)) {
			options = {
				width: options,
				height: options
			};
		}
		if (options.size) {
			options.width = options.height = options.size;
		}
		defaultImage = defaultImage || options.defaultImage;
		
		$(selector).each(function() {
			var img = this,
				tmp = new Image();
			tmp.onload = function() {
				if (defaultImage && isNoPic(this)) {
					img.src = defaultImage;
				} else {
					resize(img, options.width, options.height, this, options.force);
				}
				tmp.onload = null; // 修复ie7下可能会触发多次onload事件bug
				options.success && options.success(img);
			};
			tmp.src = img.src;
		});
	};
	
	function isNoPic(img) {
		return img.width <= 1 && img.height <= 1;
	}
	
	function resize(img, width, height, tmp, force) {
		var w = tmp.width,
			h = tmp.height,
			flag = false,	// flag === true时，对width进行缩放, 否则对height进行缩放
			size = 0;
		
		if (!w || !h) {
			return;
		}
		
		if (!width || !height) {	// 只指定width 或 height
			flag = !!width;
			size = width || height;
		} else {
			flag = w * height - h * width >= 0,	//图片长宽比>缩放长宽比
			size = flag ? width : height;
		}
		
		if (flag && (w > size || force)) {
			h = size * h / w;
			w = size;
		} 
		
		if (!flag && (h > size || force)) {
			w = size * w / h;
			h = size;
		}
		
		w = Math.round(w);
		h = Math.round(h);
		img.width = w;
		img.height = h;
		
		$(img).css({
			width: w + 'px',
			height: h + 'px'
		});
	}
	
})();
//~ resizeImage

/**
 * 对ie6 position fixed进行特殊处理
 * @param {jquery} div
 * @param {object} options
 *	- bottom {boolean} 是否相对于bottom
 *	- show {function} 显示逻辑
 *	- force {boolean} 是否强制特殊处理
 */
UI.positionFixed = function(div, options) {
	options = options || {};
	if (!$.util.ua.ie6 && !options.force && 
			Util.getUrlParam('debug-position-fixed') !== 'true') {
		return;
	}
	div = $(div);

	div.each(function() {
		var item = $(this),
			size = parseInt(item.css(options.bottom ? 'bottom' : 'top'), 10) || 0;
		item.css('position', 'absolute');
		item.data('positionFixed', size);
	});

	var win = $(window),
		lastScrollTop = win.scrollTop(),
		timer = null,
		show = options.show || function(item) {
			item.fadeIn();	
		},
		scrollHandler = function() {
			timeFixPos(500);
		},
		resizeHandler = function() {
			timeFixPos(50, true);	
		};

	win.on('scroll', scrollHandler);
	win.on('resize', resizeHandler);
	site.on('ui-position-fixed', scrollHandler);

	div.on('remove', function() {
		win.off('scroll', scrollHandler);
		win.off('resize', resizeHandler);
		site.off('ui-position-fixed', scrollHandler);
	});

	div.on('ui-position-fixed', function() {
	    timeFixPos(10, true);    
	});

	function timeFixPos(time, force) {
		if (lastScrollTop === win.scrollTop()) {
			// force时, fixed bottom的需要处理, 其他的都不需要		
			if (!(force && options.bottom)) { 
				return;
			}
		}
		
		div.hide();
		timer && clearTimeout(timer);
		timer = setTimeout(function() {
			timer = null;	
			lastScrollTop = win.scrollTop();
			fixPos(lastScrollTop);
		}, time);
	}

	function fixPos(scrollTop) {
		div.each(function() {
			var item = $(this),
				size = item.data('positionFixed') || 0,
				top = options.bottom ? win.height() - size - item.height() : size;
			
			item.css('top', top + scrollTop);
			show(item);
		});
	}
};
//~ positionFixed


/**
 * 简化colorPicker的使用
 */
UI.colorPicker = function(pickers) {
	$.use('ui-colorbox', function() {
		$(pickers).each(function() {
			var picker = $(this),
				span = $('span', picker),
				value = $('input.value', picker);

			span.css('background-color',  value.val());
			picker.colorbox({
				zIndex: 10000,
				color: value.val(),
				select: function(e, data) {
					value.val(data.color);
					span.css('background-color', data.color);
					picker.triggerHandler('select', data);
					$(this).colorbox('hide');
				}
			});
		});
	});
};


UI.colorChooser = function(pickers, options) {
	options = options || {};

	var handle = function(ColorChooser, picker, span, value) {
		var chooser = new ColorChooser(picker, {
			value: value.val(),
			className: 'widget-color-chooser-simple',
			transparent: options.transparent,
			confirm: function(data) {
				value.val(data.color);
				span.css('background-color', data.color);
				span.toggleClass('color-transparent', data.color === 'transparent');
				picker.triggerHandler('select', data);
			}
		});

		var doc = $(document),
		fn = function(e) {
			var panel = chooser.getPanel();
			if (!panel) {
				return;
			}

			if (picker[0] === e.target || 
					picker.has(e.target).length ||
					panel[0] === e.target || 
					panel.has(e.target).length) {
				return;
			}

			chooser.close();
			doc.off('click', fn);
		};
		
		doc.on('click', fn);
	};

	$(pickers).each(function() {
		var picker = $(this),
			span = $('span', picker),
			value = $('input.value', picker),
			color = null;
			
		value = value.length ? value : picker.next('input.value');
		color = value.val();

		if (color === 'transparent') {
			span.addClass('color-transparent');
		} else {
			span.css('background-color', color);
		}

		picker.on('click', function(e) {
			e.preventDefault();	
			site.require(['widget.ColorChooser'], function(ColorChooser) {
				handle(ColorChooser, picker, span, value);
			});
		});
	});

};
//~


/**
 * 简化datePicker的使用
 */
UI.datePicker = (function() {

return function(pickers) {
	$(pickers).each(function() {
		init($(this));
	});
};

function init(picker) {
	var text = $('span.text', picker),
		value = $('input.value', picker),
		initDate = getDate(value.val()),
		pickerUi = { picker: picker, text: text, value: value };

	picker.datepicker({
		date: initDate,
		zIndex: 3200,
		select: function(e, ui) {
			dateSelect(ui.date, pickerUi);
		},
		beforeShow: function() {
			return !picker.hasClass('disabled');
		},
		closable: true
	});

	picker.on('dateselect', function(e, date) {
		dateSelect(date, pickerUi);
	});

	initDate ? dateSelect(initDate, pickerUi) : text.text('请选择日期');
}

function dateSelect(date, ui) {
	var picker = ui.picker,
		str = $.util.substitute('{0}-{1}-{2}', 
			[date.getFullYear(), date.getMonth() + 1, date.getDate()]);
	ui.text.text(str);
	ui.value.val(getDateTime(date));
	picker.data('date', date);
	picker.trigger('datechange', date);
}

function getDate(text) {
	var date = null,
		time = parseInt(text.trim(), 10);
	if (time) {
		date = new Date();
		date.setTime(time);
		return date;
	}
}

function getDateTime(date) {
	return date.getTime();
}

})();
//~


/**
 * 图片银行
 */
$.add('site-sys-ibank', {
	css: ['http://style.c.aliimg.com/sys/css/ibank/ibank-min.css'],
	js: ['http://style.c.aliimg.com/sys/js/ibank/ibank-min.js'],
	ver: '1.0'
});

UI.iBank = function(options) {
	$.use('site-sys-ibank', function() {
		options = $.extend({
			source: 'winport_diy',
			allowMultiple: false,
			tabs: ['album', 'upload']
		}, options);

		FE.sys.iBank(options);
	});
};


return UI;
		
});


/**
 * 图片缩放
 */
define('ui.ImageResizer', ['jQuery', 'ui.UI'], function($, UI) {

return function(container, options) {
	var imgs = container.is('img') ? container :
			$(container.selector || 'img', container);

	UI.resizeImage(imgs, options);
};

});
