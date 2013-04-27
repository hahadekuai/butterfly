/**
 * App autowire°ó¶¨
 *
 * @author qijun.weiqj
 */
define('context.Autowire', ['loader', 'jQuery', 'Class', 'Log'], 

function(loader, $, Class, Log) {

var Config = loader.require('config'),
	log = new Log('context.Autowire');


var Autowire = new Class({
	
	init: function(div, options) {
		div = $(div);
		options = options || {};

		if (!div.length) {
			log.warn('please specify parent element for autowire');
			return;
		}

		this.loader = Config.get(options.loader);
		if (!this.loader) {
			log.error('invalid loader: ' + options.loader);
			return;
		}

		this.executor = options.executor;

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
		var self = this;

		if (config.__autowired) {
			return;
		}
		config.__autowired =  true;

		log.info('initialize ' + type);
		this.loader.require([type], function(o) {
			var fn = function() {
				if (typeof o === 'function') {
					new o(elm, config);
				} else if (o && o.init) {
					o.init(elm, config);
				} else if (config.method && o[method]) {
					o[method](elm, config);
				} else {
					log.warn('invalid module for autowire: ' + type);
				}
			};

			self.executor ? self.executor.execute(fn) : fn();
		});
	}
	
});

return Autowire;


});
