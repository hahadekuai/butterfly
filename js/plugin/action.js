/**
 * 旺医生等自动action
 *
 * @author qijun.weiqj
 */
define(['jQuery', 'PageContext'], 

function($, PageContext) {

var Action = {

	init: function() {
		var hash = (window.location.hash || '').substr(1);
		if (!hash) {
			return;
		}

		var parts = hash.split('&'),
			o = {};
		
		$.each(parts, function(i, part) {
			var pos = part.indexOf('=');
			if (pos !== -1) {
				o[part.substr(0, pos)] = part.substr(pos + 1);
			}
		});
	
		// 要等domready后才触发action事件
		o.action &&	site.on('domready-complete', function() {
			site.trigger('action-' + o.action, o);
		});

	}

};

PageContext.add('plugin.Action', Action);


});
