/**
 * 一些常见效果
 * @author qijun.weiqj
 */
define('fx.Effect', ['jQuery', 'Log'], function($, Log) {

var log = new Log('fx.Effect');

var Effect = function(div, config) {
	config = config || {};
	var type = config.type || config,
		effect = Types[type];
	
	if (!effect) {
		log.error('effect type: ' + type + ' not exist');
		return;
	}
	$(div).each(function() {
		new effect($(this), config);
	});
};


var Types = {};

/**
 * toggle
 */
Types.toggle = function(div, config) {
	var toggle = config.className || 'fx-toggle',
		trigger = config.trigger || '.fx-trigger';
	
	div.on('click', trigger, function(e) {
		var elm = $(this),
			container = config.item ? elm.closest(config.item) : div;
		if (elm.is('a')) {
			e.preventDefault();
		}
		
		container.toggleClass(toggle);
	});
};
//~


/**
 * hover
 */
Types.hover = function(div, config) {
	var item = config.item || '.fx-item',
		hover = config.className || 'hover fx-hover';

	div.on('mouseenter', item, function() {
		$(this).addClass(hover);
	});

	div.on('mouseleave', item, function() {
		$(this).removeClass(hover);
	});
};
//~

return Effect;

});
