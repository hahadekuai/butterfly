/**
 * 延迟模块包装器
 */
define('context.LazyMod', 
		['require', 'jQuery', 'Log'], 
		function(require, $, Log) {

var log = new Log('context.LazyMod');


// 先实现一个延时加载器, 因为这是一个非常基础的模块
// 所以不依赖于ui.LazyInitializer
var win = $(window),
	lazyList = [],
	timer = null,
	isReady = false;

var lazy = function(div, options) {
	lazyList.push({
		element: $(div),
		handler: options.handler,
		spacing: options.spacing || 0
	});

	if (!isReady) {
		win.on('scroll resize', function() {
			timer && clearTimeout(timer);	
			timer = setTimeout(handle, 100);
		});
		isReady = true;
		guard();
	}
	
	handle();
};
//~

var handle = function() {
	timer = null;
	var sTop = win.scrollTop(),
		wHeight = win.height(),
		remove = [];

	$.each(lazyList, function(index, item) {
		var elm = item.element,
			eTop = elm.offset().top;
		if (eTop < sTop + wHeight + item.spacing) {
			log.info('lazy init mod for ', elm);
			item.handler();
			remove.push(index);
		}
	});

	for (var i = remove.length - 1; i >=0; i--) {
		lazyList.splice(remove[i], 1);
	}
};

// 有时候页面比较复杂
// 所以使用这个保证节点可以正常初始化
var guard = function() {
	var i = 0,
		fn = function() {
			handle();	
			i++;
			i < 20 && setTimeout(fn, 500);
		};
	setTimeout(fn, 500);
};
//~

// 返回一个被包装过的模块
return function(target) {
	var isFunc = typeof target === 'function',
		entry = isFunc ? target : target.init;

	var newInit = function(div) {
		var context = this,
			args = arguments,
			lazyOptions = this.lazyOptions || {},
			res = [],
			js = lazyOptions.js,
			css = lazyOptions.css;

		js && res.push.apply(res, $.makeArray(js));
		css && res.push.apply(res, $.makeArray(css));

		var loadRes = function() {
			var defer = $.Deferred();
			if (res.length) {
				require(res, function() {
					defer.resolve();
				});
			} else {
				defer.resolve();
			}
			return defer;
		};

		lazy(div, {
			handler: function() {
				loadRes().done(function() {
					log.info('before done, initializing...')
					entry.apply(context, args);
				});
			},
			spacing: lazyOptions.spacing
		});	
	};

	if (isFunc) {
		newInit.prototype = target.prototype;
		return newInit;
	} else {
		var o = $.extend({}, target);
		o.init = newInit;
		return o;
	}

};


});
