/**
 * 简单页面打点类
 * @author qijun.weiqj
 */
define(['jQuery', 'PageContext'], function($, PageContext) {

var TraceLog = {
	
	init: function() {
		setTimeout($.proxy(this, 'initAutoTracelog'), 5000);
		setTimeout($.proxy(this, 'initExpTracelog'), 3000);
	},

	initAutoTracelog: function() {
		var self = this;

		this.handle('click', function(elm, tracelog) {
			// ignore input:text and select
			if (elm.is('input:text') || elm.is('select')) {
				return;
			}

			self.trace(tracelog);
		});

		this.handle('change', function(elm, tracelog) {
			elm.is('select') && self.trace(tracelog);
		});

		var field = 'tracelogLastValue';
		this.handle('blur', function(elm, tracelog) {
			if (elm.is('input:text')) {
				var last = elm.data(field),
					now = elm.val();
				if (last !== now) {
					self.trace(tracelog);
					elm.data(field, now);
				}
			}
		});
	},

	handle: function(event, action) {
		$('body').on(event, '[data-tracelog]', function() {
			var elm = $(this),
				tracelog = elm.data('tracelog');	

			tracelog && action(elm, tracelog);
		});
	},

	initExpTracelog: function() {
		var self = this,
			fn = function(div) {
				var elms = $('div[data-tracelog-exp],ul[data-tracelog-exp]', div);
				elms.each(function() {
					var elm = $(this),
						tracelog = elm.data('tracelogExp');
					tracelog && self.trace(tracelog);
					elm.removeData('tracelogExp');
				});
			};

		fn('body');
		site.on('widget-tracelog', fn);
	},

	trace: function(tracelog) {
		aliclick(null, '?tracelog=' + tracelog);
	}
};


PageContext.add('plugin.TraceLog', TraceLog);

		
});
