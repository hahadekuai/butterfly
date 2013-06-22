/**
 * UI�๤�߷���
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
 * �ȱ�������ͼƬʹ�����߲�����size, ����С��size��ͼƬ����������
 * @param {selector|element} selector ��Ҫ���ŵ�ͼƬ
 * @param {number | options} options|size ��ߴ�С
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
				tmp.onload = null; // �޸�ie7�¿��ܻᴥ�����onload�¼�bug
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
			flag = false,	// flag === trueʱ����width��������, �����height��������
			size = 0;
		
		if (!w || !h) {
			return;
		}
		
		if (!width || !height) {	// ָֻ��width �� height
			flag = !!width;
			size = width || height;
		} else {
			flag = w * height - h * width >= 0,	//ͼƬ�����>���ų����
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
 * ��ie6 position fixed�������⴦��
 * @param {jquery} div
 * @param {object} options
 *	- bottom {boolean} �Ƿ������bottom
 *	- show {function} ��ʾ�߼�
 *	- force {boolean} �Ƿ�ǿ�����⴦��
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
			// forceʱ, fixed bottom����Ҫ����, �����Ķ�����Ҫ		
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
 * ��colorPicker��ʹ��
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
 * ��datePicker��ʹ��
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

	initDate ? dateSelect(initDate, pickerUi) : text.text('��ѡ������');
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
 * ͼƬ����
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
 * ͼƬ����
 */
define('ui.ImageResizer', ['jQuery', 'ui.UI'], function($, UI) {

return function(container, options) {
	var imgs = container.is('img') ? container :
			$(container.selector || 'img', container);

	UI.resizeImage(imgs, options);
};

});
