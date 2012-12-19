/**
 * App autowire°ó¶¨
 */
define('ui.Autowire', ['require', 'jQuery', 'Class', 'Log'], 

function(require, $, Class, Log) {

var log = new Log('ui.Autowire');

var Autowire = new Class({
	
	init: function(div) {
		div = $(div);
		if (!div.length) {
			log.warn('please specify parent element for autowire');
			return;
		}

		var self = this,
			elms = $('[data-widget-type]', div); 
		elms.length && elms.each(function() {
			self.handle($(this));
		});
	},

	handle: function(elm) {
		var self = this,
			type = elm.data('widget-type'),
			config = elm.data('widget-config') || {};

		if (config['__autowired']) {
			return;
		}
		config['__autowired'] = true;
		
		if ($.isArray(type)) {
			$.each(type, function(index, item) {
				self.process(item, config[index] || config, elm);
			});
		} else {
			self.process(type, config, elm);
		}
	},

	process: function(type, config, elm) {
		log.info('initialize ' + type);
		require([type], function(o) {
			try {
				new o(elm, config);
			} catch (e) {
				log.error(e);
			}
		});
	}
	
});

return Autowire;


});
