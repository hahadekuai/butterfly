/**
 * 延迟初始化组件
 * @author qijun.weiqj
 */
define('ui.LazyInitializer', ['jQuery', 'Log', 'util.Util'], function($, Log, Util) {

var log = new Log('ui.LazyInitializer');

var win = $(window),
	lazyList = [],
	inited = false;


var LazyInitializer = function(div, fn) {
	div = $(div);
	lazyList.push({ 
		element: div, 
		fn: function() {
			try {
				fn.apply(this, arguments);
			} catch (e) {
				log.error('lazy init error');
			}
		}
	});
	
	if (!inited) {
		win.on('scroll resize', function() {
			Util.schedule('widget-lazy-initializer', handler, 100);
		});
		inited = true;
		guard();
	}
	
	Util.schedule('widget-lazy-initializer', handler, 100);
};


var handler = function() {
	var sTop = win.scrollTop(),
		wHeight = win.height();

	$.each(lazyList, function(index, item) {
		if (item.inited) {
			return;
		}

		var eTop = item.element.offset().top;
		if (eTop < sTop + wHeight) {
			log.info('lazy initialize for ' + item.element);
			item.fn();
			item.inited = true;
			item.element.trigger('widget-lazy-initializer');
		}		
	});

};

var guard = function() {
	var i = 0,
		fn = function() {
			handler();	
			i++;
			i < 20 && setTimeout(fn, 500);
		};
	setTimeout(fn, 500);
};

return LazyInitializer;

});

