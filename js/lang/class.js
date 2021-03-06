/**
 * 提供一种统一且简单的方式创建Class
 *
 * @author qijun.weiqj
 */
define('lang.Class', ['lang.Lang'], function(_) {

'use strict'


/**
 * 如:
 *	 var Dialog = new Class({
 *		init: function() {
 *			...
 *		}
 *	 });
 *
 *	然后可以这样使用：
 *	
 *	 var dialog = new Dialog({ width: 400, height: 300 });
 */
var Class = function(parent, o) {
	// 可以省略第一个参数
	if (!o) {
		o = parent;
		parent = null;
	}
	var klass = function() {
			// 可以定义initialize 或 init为构造函数
			var init = this.initialize || this.init;
			return init && init.apply(this, arguments);
		},
		proto = null;

	if (parent) {
		proxy.prototype = typeof parent === 'function' ? 
				parent.prototype : parent;
		proto = new proxy();
	} else {
		proto = {};
	}

	klass.prototype = _.extend(proto, o);
	return klass;
};

var proxy = function() {};

return Class;

});


define('Class', ['lang.Class'], function(Class) {
	return Class;
});

