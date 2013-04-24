/**
 * 用于支持Parser的编写
 * 实现类可以mixin这个模块
 *
 * @code
 *  var HtmlParser = new Class({
 *		init: function(html) {
 *			this.body = html	
 *		},
 *		...
 *  });
 *
 *	ParserModule.mixin(HtmlParser);
 *
 * @author qijun.weiqj
 *
 */
define('util.ParserModule', ['jQuery', 'Log'], function($, Log) {

var log = new Log('util.ParserModule');


var Helper = {
	/**
	 * 在body中匹配pattern, 从from位置开始
	 * @param {string} body
	 * @param {string} pattern
	 * @from {number} from 从这个位置开始匹配
	 *
	 * @return {object}
	 *	- text 匹配的字符串
	 *	- pos  匹配的位置
	 */
	match: function(body, pattern, from) {
		var re = this._regexps[pattern];
		if (!re) {
			re = this._regexps[pattern] = 
					new RegExp(pattern, 'g');
		}
		re.lastIndex = from;

		var match = re.exec(body);
		return match ? {
			text: match[0],
			pos: re.lastIndex >= from ? 
				re.lastIndex - match[0].length: 
				body.length - match[0].length
		} : false;
	},
	
	_regexps: {}	
};

var Mixin = {

	/**
	 * 判断当前位置是否匹配指定样式
	 * @param {string} pattern
	 *
	 * @return {boolean}
	 */
	_check: function(pattern) {
		var o = Helper.match(this.body, '\\s*' + pattern, this.pos);
		return o ? o.pos === this.pos : false;
	},

	/**
	 * 略过指定样式字符串
	 * @param {string} pattern
	 */
	_skip: function(pattern) {
		var o = Helper.match(this.body, '\\s*' + pattern, this.pos);
		if (o && (!pattern || this.pos === o.pos)) {
			this.pos += o.text.length;
		} else {
			this._error('skip fail: ' + pattern);
		}
	},

	/**
	 * parse到指定样式
	 * @param {string} pattern
	 * @param {boolean} 不对结果进行trim, 
	 *		默认会对parse的结果进行trim
	 *
	 * @return {string}
	 */
	_until: function(pattern, notrim) {
		var o = Helper.match(this.body, pattern, this.pos);
		if (!o) {
			this._error('parse until fail: ' + pattern);
			return;
		}

		var last = this.pos,
			value = this.body.substring(last, o.pos);

		this.pos = o.pos;
		return notrim ? value : $.trim(value);
	},

	_error: function(msg) {
		throw new Error(msg);
	}
};
//~ Mixin

return {
	mixin: function(klass) {
		$.extend(klass.prototype, Mixin);
		klass.parse = klass.parse ||
				$.proxy(this, '_parse', klass);
		return klass;
	},

	_parse: function(klass, body) {
		var parser = new klass(body),
			start = $.now(),
			success = false,
			result = null,
			message = null;

		try {
			result = parser.parse();
			success = true;
		} catch (e) {
			message = parser.message;
		}

		log.info('parse cost: ' + ($.now() - start));

		return {
			success: success,
			result: result,
			message: message,
			pos: parser.pos
		};
	}
};
//~ ParserModule
		
});
