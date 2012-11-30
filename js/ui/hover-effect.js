/**
 * HoverEffect
 * ������Ƶ�Ԫ����ʱ�����class
 * ������Ƴ�Ԫ����ʱ���Ƴ�class
 * @author qijun.weiqj
 */
define('ui.HoverEffect', ['jQuery'], function($) {
	
/**
 * ��ʼ��HoverEffect
 * @param {element} div
 * @param {object} options
 *	- selector Ԫ��ѡ������Ĭ��Ϊ ui-hover-effect
 *	- hover hoverʱ����ӵ�class, Ĭ��Ϊhover
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
