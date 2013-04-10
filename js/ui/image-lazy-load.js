/**
 * Õº∆¨—”≥Ÿº”‘ÿ
 * @author qijun.weiqj
 */
define('ui.ImageLazyLoad', 
		['jQuery', 'Class', 'ui.LazyInitializer'], 
		function($, Class, LazyInitializer) {

return new Class({
	init: function(div) {
		var selector = 'img[data-lazy-load-src]',
			fn = function() {
				var imgs = $(selector, div);
				imgs.each(function() {
					var img = $(this),
						src = img.data('lazyLoadSrc');
					img.attr('src', src);
					img.trigger('widget-image-lazy-load');
				});
			};

		new LazyInitializer(div, fn);
	}
	
});
	
		
});
