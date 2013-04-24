/**
 * 对jQuery的模块包装
 * 添加toString支持以方便日志打印
 *
 * @author qijun.weiqj
*/
define('jQuery', ['loader'], function(Loader) {

var Log = Loader.require('log');

if (Log.isEnabled('info')) {

	jQuery.fn.toString = function() {
		var html = [];
		this.each(function() {
			if (!this.tagName) {
				return;
			}

			var s = [],
				tag = this.tagName.toLowerCase(),
				id = this.id,
				className = this.className;

			s.push('<' + tag);
			id && s.push(' id="' + id + '"');
			className && s.push(' class="' + className + '"');
			s.push('>');
			html.push(s.join(''));
		});

		return '[' + html.join(', ') + ']';
	};

	var orijQuery = jQuery,
		warn = console && console.warn ? 
				orijQuery.proxy(console, 'warn') : orijQuery.noop;

	jQuery = function(selector, context) {
		if (typeof selector === 'string' && 
				selector !== 'body' &&
				!/^\s*</.test(selector) && 
				!/^#/.test(selector)) {

			if (context === undefined) {
				warn('please specify context for '+ selector + ' in ', 
						arguments.callee.caller);
			}

			if (/^\.\[-\w]+/.test(selector)) {
				warn('please specify tag for selector ' + selector + ' in ', 
						arguments.callee.caller);
			}
		}

		return orijQuery.apply(this, arguments);
	};
	orijQuery.extend(jQuery, orijQuery);
	jQuery.prototype = orijQuery.prototype;

}

return jQuery;

});


define('jquery', function() {
	return jQuery;	
});
