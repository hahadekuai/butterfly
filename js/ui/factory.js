/**
 * 用于方便初始化UI组件
 * @author qijun.weiqj
 */
define('ui.Factory', ['require', 'jQuery'], function(require, $) {

/**
 * @param {element} div 节点
 * @param {object} options
 *	- itemSelector 默认为 li, 会对div内部符合itemSelector的元素使用组件
 *	- widgetId 组件id
 */
return function(div, options) {
	options = options || {};	
	if (!options.widgetId) {
		throw new Error('please specify widgetId');
	}

	require([options.widgetId], function(widget) {
		elms = $(options.itemSelector || 'li', div);
		elms.each(function() {
			new widget($(this), options);
		});
	});
};
	
});
