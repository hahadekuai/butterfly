/**
 * HtmlParser
 * @author qijun.weiqj
 */

/**
 * HtmlParser 用于将Html解析成以下结构
[
	{
		type: 'element' | 'text' | 'comment'
		name: {string}
		attributes: [{ name: {string}, value: {string}, pos: {number}} ]
		body: 
			{array} if type == 'element'
			{string} if type == 'text' || type == 'comment',
		pos: {number}
	},
	...
] 
 */

/**
 * 用法
 * var o = Parser.parse(html);
 * if (o.success) {
 *	var nodes = o.result;
 *	...
 * } else {
 *	var errorPos = o.pos,
 *		errorMessage = o.message;
 * }
 */
define('util.HtmlParser', ['jQuery', 'Class', 'Log', 'util.BaseParser'], 

function($, Class, Log, BaseParser) {

var log = new Log('util.HtmlParser');

var print = function(text) {
	log.info('  ' + text);
};

var Parser = new Class({
	
	init: function(html) {
		this.html = this.body = html || '';
		this.pos = 0;
	},

	parse: function(inner) {
		var html = this.html,
			ret = this.result = [];

		while (this.pos < html.length) {
			if (inner && this._checkEndTag()) {
				break;
			}
			ret.push(this.parseNode());
		}

		return ret;
	},

	_checkEndTag: function() {
		var last = this.pos;

		if (this._check('<')) {
			this._skip('<')
			var check = this._check('/');
			this.pos = last;
			return check;
		}
		return false;
	},

	parseNode: function() {
		if (this._check('<!--')) {
			return this.parseComment();	
		}

		if (this._check('<')) {
			return this.parseElement();
		}

		return this.parseText();
	},

	parseComment: function() {
		log.info('parse comment')
		
		var nodePos = this.pos;

		this._skip('<!--');
		this.message = '注释未正常结束';
		var body = this._until('-->');
		this._skip('-->');

		print(body);

		return {
			type: 'comment',
			body: body,
			pos: nodePos
		};
	},

	parseElement: function() {
		log.info('parse element');

		var nodePos = this.pos;

		this._skip('<');
		var name = this.parseTag(),
			attrs = this.parseAttributes(),
			enclose = this._check('/'),
			body = null;

		if (enclose) {
			this._skip('/');
		}

		this.message = '标签未正常闭合';
		this._skip('>');

		if (!enclose && $.inArray(name.toLowerCase(), this._enclose) === -1) {
			body = this.parseBody(name);
			this._skipEndTag(name);
		} else {
			body = [];
		}
		
		return {
			type: 'element',
			name: name,
			enclose: enclose,
			attributes: attrs,
			body: body,
			pos: nodePos
		};
	},

	parseTag: function() {
		log.info('parse tag');
		var name = this._untilp(/[^-\w]/);
		if (!name) {
			this.message = '无效的标签名称';
			this._error('invalid tag name');
		}
		print(name);
		return name;
	},

	parseAttributes: function() {
		log.info('parse attributes');
		
		var attrs = [];
		while (!(this.pos >= this.html.length || 
				this._check('/') || this._check('>'))) {
			attrs.push(this.parseAttribute());
		}

		return attrs;
	},

	parseAttribute: function() {
		log.info('parse attribute');

		var nodePos = this.pos;
		
		var name = this._untilp(/[^-\w]/),
			value = undefined,
			q = null;

		if (!name) {
			this.message = '无效的属性名称';
			this._error('invalid property name');
		}

		if (this._check('=')) {
			this._skip('=');
			if (this._check('"')) {
				q = '"';
				this._skip(q);
				value = this._until(q);
				this.message = '属性值缺少结束双引号';
				this._skip(q);

			} else if (this._check("'")) {
				q = "'";
				this._skip(q);
				value = this._until(q);
				this.message = '属性值缺少结束单引号';
				this._skip(q);
			} else {
				value = this._untilp(/[\s\/>]/);
				if (!$.trim(value)) {
					this.message = '缺少属性值';
					this._error('invalid property value');
				}
			}
		}

		print(name + ': ' + value);
		return { name: name, value: value, pos: nodePos };
	},

	parseBody: function(name) {
		log.info('parse body');
		// there is an bug in here
		// where end with '< /'
		if ($.inArray(name.toLowerCase(), this._bodyText) !== -1) {
			this.message = '缺少结束标签</' + name + '>';
			var body = this._until('</' + name + '>', false, true);
			print(body);
			return {
				type: 'text',
				body: body,
				pos: this.pos
			}
		}

		return this.parse(true);
	},

	parseText: function() {
		log.info('parse text');
		var nodePos = this.pos,
			body = this._until('<', true, true);

		print(body);

		return {
			type: 'text',
			body: body,
			pos: nodePos
		};
	},

	_skipEndTag: function(name) {
		log.info('skip end tag: ' + name);
		this.message = '缺少结束标签</' + name + '>';
		var end = '</' + name + '>';
		if (this._check(end)) {
			this._skip(end);
		} else {
			this._skip('<');
			this._skip('/');
			this._skip(name);
			this._skip('>');
		}
	},

	_enclose: ['area', 'br', 'hr', 'img', 'input', 'meta', 'link'],
	_bodyText: ['textarea', 'script']
	
});

BaseParser.mixin(Parser);

return Parser;


});
