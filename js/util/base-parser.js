/**
 * 用于方便Parser的编写
 * 实现类应该MixinBaseParser
 *
 * @code
 *	var Parser = new Class({...})
 *	BaseParser.mixin(Parser);
 *
 * @author qijun.weiqj
 */
define('util.BaseParser', ['jQuery', 'Log'], function($, Log) {

var log = new Log('util.BaseParser');

var Mixin = {
	
	/**
	 * 判断当前位置是字符串str
	 */
	_check: function(str, retPos) {
		var body = this.body,
			pos = body.indexOf(str, this.pos);
		
		if (pos === this.pos) {
			return retPos ? pos : true;
		}
		if (pos > this.pos &&
				/^\s+$/.test(body.substring(this.pos, pos))) {
			return retPos ? pos : true;
		}

		return retPos ? -1 : false;
	},

	/**
	 * 略过str
	 */
	_skip: function(str) {
		var pos = this._check(str, true);
		if (pos !== -1) {
			this.pos = pos + str.length;
		} else {
			this._error('skip fail: ' + str);
		}
	},

	/**
	 * parser直到指定字符串
	 */
	_until: function(str, end, notrim) {
		var body = this.body,
			last = this.pos,
			pos = body.indexOf(str, last),
			ret = null;

		if (pos === -1 && end) {
			pos = body.length;
		}

		if (pos !== -1) {
			this.pos = pos;
			ret = body.substring(last, pos);
			return notrim ? ret : $.trim(ret);
		}

		this._error('parse until: ' + strs.join(' | '));
	},

	_untilp: function(pattern) {
		var body = this.body;

		this._skipp(/\s/);

		var last = this.pos,
			pos = last;

		while (pos < body.length &&
				!pattern.test(body.charAt(pos))) {
			pos++;
		}
		
		if (pos >= body.length) {
			this._error('parse untilp: ' + pattern);
		}

		this.pos = pos;
		return body.substring(last, pos);
	},

	_skipp: function(pattern) {
		var body = this.body,
			pos = this.pos;
		while (pattern.test(body.charAt(pos))) {
			pos++;
		}
		this.pos = pos;
	},

	_error: function(msg) {
		log.error(msg);
		throw new Error(msg);	
	}
};
//~ Mixin

return {
	mixin: function(klass) {
		$.extendIf(klass.prototype, Mixin);
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
//~ BaseParser
		
});
