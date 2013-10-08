/**
 * 延迟模块包装器
 */
define('context.LazyMod', 
		['jQuery', 'lang.Log'], 
		function($, Log) {

var log = new Log('context.LazyMod');


// 实现一个延时加载器
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
		}).on('initAllLazyMode',function(){
			initAllLazyMode();
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


//全部模块加载事件
//用于需要提前初始化所有懒加载模块的情况
var initAllLazyMode = function(){
	var	remove = [];

	$.each(lazyList, function(index, item) {
		var elm = item.element;
		
		log.info('lazy init mod for ', elm);
		item.handler();
		remove.push(index);
	});

	for (var i = remove.length - 1; i >=0; i--) {
		lazyList.splice(remove[i], 1);
	}
	win.trigger('initAllLazyModeDone');
};


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
		// TODO
		// 需要兼容fdev5 loader，所以这里暂时不使用require加载资源，而使用jquery加载js
		//css && res.push.apply(res, $.makeArray(css));

		var loadRes = function() {
			var defer = null;
			if (res.length) {
				defer = $.when();
				$.each(res, function(index, url) {
					defer = defer.pipe(function() {
						return $.ajax(url, { dataType: 'script' });
					});
				});
			} else {
				defer = $.Deferred();
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
