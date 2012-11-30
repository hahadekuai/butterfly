/**
 * HoverEffect
 * 当鼠标移到元素上时，添加class
 * 当鼠标移出元素上时，移除class
 * @author qijun.weiqj
 */
define('ui.HoverEffect', ['jQuery'], function($) {
	
/**
 * 初始化HoverEffect
 * @param {element} div
 * @param {object} options
 *	- selector 元素选择器，默认为 ui-hover-effect
 *	- hover hover时，添加的class, 默认为hover
 */
return function(div, options) {
	div = $(div);

	options = options || {};

	var selector = options.selector || '.ui-hover-effect',
		hover = options.hover || 'hover';

	div.on('mouseenter', selector, function() {
		var elm = $(this);
		elm.addClass(elm.data('hoverEffect') || hover);
	});

	div.on('mouseleave', selector, function() {
		var elm = $(this);
		elm.removeClass(elm.data('hoverEffect') || hover);
	});

};
		
});
