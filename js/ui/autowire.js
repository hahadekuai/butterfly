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

		if ($.isArray(type)) {
			$.each(type, function(index, item) {
				self.process(item, config[index] || {}, elm);
			});
		} else {
			self.process(type, config, elm);
		}
	},

	process: function(type, config, elm) {
		if (config.__autowired) {
			return;
		}
		config.__autowired =  true;

		log.info('initialize ' + type);
		require([type], function(o) {
			try {
				if (typeof o === 'function') {
					new o(elm, config);
				} else if (o && o.init) {
					o.init(elm, config);
				}
			} catch (e) {
				log.error(e);
			}
		});
	}
	
});

return Autowire;


});
