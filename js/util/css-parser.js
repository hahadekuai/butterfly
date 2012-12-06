/**
 * �򵥽���/������css�ַ���
 * 
 * @author qijun.weiqj
 */
define('util.CssParser', ['jQuery', 'Class', 'Log', 'util.ParserModule'], 

function($, Class, Log, ParserModule) {


var log = new Log('util.CssParser');

var print = function(text) {
	log.info('  ' + text);
};


var R_SELECTOR = /[^;{}'"]/,
	R_PROPERTY = /^[*_+\\]?-?[_a-z\\][\\_a-z0-9-]*$/;


var CssParser = new Class({

	init: function(css) {
		this.css = this.body = this._filter(css);
		this.pos = 0;
	},

	_filter: function(css) {
		var rComment = /\/\*[^*]*\*+([^/][^*]*\*+)*\//gm;
		return css.replace(rComment, function(s) {
			log.info('filter comment: ' + s);
			return s.replace(/\S/g, ' ');	
		});
	},
	
	parse: function() {
		var css = this.css,
			ret = this.result = [];
		
		this._skip('');
		while (this.pos < css.length) {
			ret.push(this.parseRuleset());	
			this._skip('');
		}

		return ret;
	},

	parseRuleset: function() {
		log.info('parse ruleset');

		this.message = '��Ч����ʽ';

		var css = this.css,
			nodePos = this.pos,
			selector = this._until('{'),
			styles = [];
	
		this._checkValue(selector, R_SELECTOR, '��Ч��ѡ����: ' + selector);	
		print(selector);

		this._skip('{');

		while (this.pos < css.length && !this._check('}')) {
			styles.push(this.parseStyle());
		}
		
		this.message = '��ʽ����δ����������ȱ��}';
		this._skip('}');

		return { selector: selector, styles: styles, pos: nodePos };
	},

	parseStyle: function() {
		log.info('parse style');

		this._skipSemicolon();

		var nodePos = this.pos,
			property = 	this._until(':');
		this._checkValue(property, R_PROPERTY, '��Ч��������: ' + property);
		print(property);

		this._skip(':');

		var value = this._until('[;\\}]');
		if (!value) {
			this.message = '��Ч������ֵ: ' + value;
			this._error('invalid property value');
		}
		print(value);

		this._skipSemicolon();
		
		return { property: property, value: value, pos: nodePos };
	},

	_skipSemicolon: function() {
		while (this._check(';')) {
			this._skip(';');
		}
	},

	_checkValue: function(v, pattern, message) {
		if (!pattern.test(v)) {
			this.message = message;
			this._error(v + ' should be match ' + pattern);
		}
	}
  
});
//~ CssParser

ParserModule.mixin(CssParser);


$.extend(CssParser, {

	parseCssWithCheck: function(css) {
		var success = false,
			message = '',
			line = '',
			parser = new CssParser(css);
		try {
			parser.parse();
			success = true;
		} catch (e) {
			line = css.substr(parser.pos - 10, 20).replace(/\n/g, ' ');
			message = '����css����,��ش���:' + line;
		}
		
		return { success: success, message: message, data: parser.result };
	},

	/**
	 * ����css�ַ�������json
	 * @return {array}
	 * 	[
	 * 		{ 
	 * 			selector: 'div.custom-bg', 
	 * 			styles:  [
	 * 				{
	 * 					property: 'background-color',
	 * 					value: '#FFFFFF'
	 * 				},
	 * 				{
	 * 					property: 'background-image',
	 * 					value: url(...)
	 * 				},
	 * 			]
	 * 		},
	 * 		...
	 * 	]
	 */
	parseCss: function(css) {
		var self = this,
			ret = [],
			regexp = /([^\{\}]+)\{([^\}]+)\}/gm,
			match = null,
			reComment = /\/\*[^*]*\*+([^/][^*]*\*+)*\//gm,
			start = $.now();

		css = css.replace(reComment, '');
		
		while ((match = regexp.exec(css))) {
			ret.push({
				selector: $.trim(match[1]).replace(/\s+/g, ' '),
				styles: self._parseStyleBody(match[2])
			});
		}
		
		log.info('parse css cost: ' + ($.now() - start));
		
		return ret;
	},
	
	/**
	 * ������ʽ��
	 */
	_parseStyleBody: function(body) {
		var styles = [],
			regexp = /([^:]+):([^;]+);/gm,
			match = null;
		
		while ((match = regexp.exec(body))) {
			styles.push({
				property: $.trim(match[1]),
				value: $.trim(match[2])
			});
		}
		
		return styles;
	},
	
	
	/**
	 * ����json����css�ַ���
	 * @return {string}
	 */
	toCss: function(json) {
		var css = [];
		$.each(json, function() {
			var o = this,
				part = [];
			$.each(o.styles, function() {
				var style = this;
				if (style.value) {
					part.push(style.property + ': ' + style.value + '; ');
				}
			});
			if (part.length) {
				css.push(o.selector + ' { ');
				css.push(part.join(''));
				css.push(' }\n');
			}
		});
		return css.join('');
	},
	
	/**
	 * ����ʽjson�ṹ��ȡ��ָ����ʽ
	 * @return {object}
	 * 	- property
	 * 	- value
	 */
	getStyle: function(json, selector, property) {
		selector = $.trim(selector).replace(/\s+/, ' ');
		property = $.trim(property);
		for (var i = 0, c = json.length; i < c; i++) {
			var o = json[i],
				styles = o.styles;
			if (o.selector === selector) {
				return this._getStyle(o, property);
			}
		}
	},
	
	_getStyle: function(o, property) {
		var styles = o.styles,
			style = null;
		if (!property) {
			return o;
		}
		
		for (var i = 0, c = styles.length; i < c; i++) {
			style = styles[i];
			if (style.property === property) {
				return style;
			}
		}
	},
	
	/**
	 * ������ʽ����ʽjson�ṹ, ������ӵĻ��޸ĵ���ʽ����
	 * @return {object}
	 * 	- property
	 * 	- value
	 */
	setStyle: function(json, selector, property, value) {
		selector = $.trim(selector);
		property = $.trim(property);
		value = $.trim(value || '');

		var o = this.getStyle(json, selector);
		if (!o) {
			o = { selector: selector, styles: [] };
			json.push(o);
		}
		
		var styles = o.styles,
			style = null;
		for (var i = 0, c = styles.length; i < c; i++) {
			style = styles[i];
			if (style.property === property) {
				style.value = value;
				return style;
			}
		}
		
		style = { property: property, value: value };
		styles.push(style);
		return style;
	},
	
	/**
	 * ��������css�ַ���, ����ͼƬ��ַ
	 * @return {string}
	 */
	getBkImgUrl: function(css) {
		var pattern = /url\(([^)]+)\)/;
		return (pattern.exec(css) || {})[1];
	}
});
//~CssParser

return CssParser;

});
