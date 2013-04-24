/**
 * ����֧��Parser�ı�д
 * ʵ�������mixin���ģ��
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
	 * ��body��ƥ��pattern, ��fromλ�ÿ�ʼ
	 * @param {string} body
	 * @param {string} pattern
	 * @from {number} from �����λ�ÿ�ʼƥ��
	 *
	 * @return {object}
	 *	- text ƥ����ַ���
	 *	- pos  ƥ���λ��
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
	 * �жϵ�ǰλ���Ƿ�ƥ��ָ����ʽ
	 * @param {string} pattern
	 *
	 * @return {boolean}
	 */
	_check: function(pattern) {
		var o = Helper.match(this.body, '\\s*' + pattern, this.pos);
		return o ? o.pos === this.pos : false;
	},

	/**
	 * �Թ�ָ����ʽ�ַ���
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
	 * parse��ָ����ʽ
	 * @param {string} pattern
	 * @param {boolean} ���Խ������trim, 
	 *		Ĭ�ϻ��parse�Ľ������trim
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
