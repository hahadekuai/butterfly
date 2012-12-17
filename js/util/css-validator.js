/**
 * ������֤css�������һ���Ĺ���
 * 
 * @author qijun.weiqj
 */
define('util.CssValidator', ['require', 'jQuery', 'Class', 'Log'], 

function(require, $, Class, Log) {

var log = new Log('util.CssValidator');

var CssValidator = new Class({
    
    init: function(rule) {
		this._prepare(rule);
        this._validators = {};
    },

	_prepare: function(rule) {
		var pattern = /^\/(.+)\/$/,
			strRules = this.strRules = {},
			regRules = this.regRules = [];

		$.each(rule, function(k, v) {
			var m = pattern.exec(k);
			if (m) {
				regRules.push({ pattern: new RegExp(m[1]), rule: v });
			} else {
				strRules[k] = v;
			}
		});
	},
	
	/**
	 * ���һ����֤��
	 * @param {string} name ����
	 * @param {function} validator ��֤����
	 */ 
    add: function(name, validator) {
		var vs = this._validators[name] || [];

		validator = typeof validator === 'string' ? 
				CssValidator.Validator[validator] : validator;
		validator = validator.test ? $.proxy(validator, 'test') : validator;

		if (typeof validator !== 'function') {
			throw new Error('invalid validator');
		}

		vs.push(validator);
        this._validators[name] = vs;
    },
    
	/**
	 * ��֤һ��css����
	 * @param {object}
	 *	[
	 *	{
	 *		selector: {string}	
	 *		styles: [
	 *			{ property: {string}, value: {string} },
	 *			...
	 *		]
	 *	},
	 *	...
	 *	]
	 *
	 * @return {boolean} ��֤�Ƿ�ɹ�
	 *	��֤�󣬿�ͨ�� this.result ȡ�������Ϣ
	 *	{
	 *		code: 'invalid_selector' | ...
	 *		message: ������Ϣ
	 *		data: �������
	 *	}
	 */
    validate: function(css) {
		for (var i = 0, c = css.length; i < c; i++) {
			var ruleset = css[i],
				selectors = $.trim(ruleset.selector).split(/\s*,\s*/);

			if (!this._validateGlobal(ruleset)) {
				return false;
			}

			for (var j = 0, jc = selectors.length; j < jc; j++) {
				if (!this._validateItem(selectors[j], ruleset)) {
					return false;
				}
			}
		}

		return true;
	},

	_validateGlobal: function(ruleset) {
		if (this._get('global')) {
			return this._validateRuleset('global', ruleset);
		}
		return true;
	},

	_validateItem: function(selector, ruleset) {
		var rule = this.strRules[selector]; // �ַ�������
		if (!rule) {
			// ������ʽ����
			$.each(this.regRules, function(index, regRule) {
				if (regRule.pattern.test(selector))	{
					rule = regRule.rule;
					return false; // break
				}
			});
		}

		if (!rule) {
			this.result = {
				code: 'invalid_selector',
				message: 'ѡ���������Ϲ���: ' + selector,
				node: ruleset
			};
			log.info('invalid selecotr: ' + selector);
			return false;
		}

		return this._validateStyles(rule, ruleset);
	},

	_validateStyles: function(rule, ruleset) {
		var valid = typeof rule === 'string' ? this._validateRuleset(rule, ruleset) :
				$.isArray(rule) ? this._validateProperties(rule, ruleset) : true;
		return valid && this._validateValues(ruleset);
	},	
	
	_validateRuleset: function(rule, ruleset) {
		var vs = this._get(rule);
		if (!vs) {
			throw new Error('invalid rule ' + rule);
		}

		var o = {};
		if (!this._validate(vs, ruleset, o)) {
			this.result = {
				code: 'invalid_ruleset',
				message: o.message || '��ʽ�����Ϲ���',
				node: o.node || ruleset
			};
			return false;
		}

		return true;
	},

	_validateProperties: function(array, ruleset) {
		var styles = ruleset.styles || [];
		for (var i = 0, c = styles.length; i < c; i++) {
			var style = styles[i];
			if ($.inArray(style.property, array) === -1) {
				this.result = {
					code: 'invalid_property',
					message: '�����������: ' + style.property,
					node: style
				};
				log.info('invalid property: ' + style.property);
				return false;
			}
		}
		return true;
	},

	_validateValues: function(ruleset) {
		var styles = ruleset.styles || [];	
		for (var i = 0, c = styles.length; i < c; i++) {
			var style = styles[i],
				vs = this._get(style.property),
				o = {};
			if (vs && !this._validate(vs, style.value, o)) {
				this.result = {
					code: 'invalid_value',
					message: o.message || ('��Ч������ֵ: ' + style.value),
					node: style
				};
				log.info('invalid value: ' + style.value);
				return false;
			}
		}
		return true;
	},

	_validate: function(validators, value, o) {
		for (var i = 0, c = validators.length; i < c; i++) {
			if (!validators[i](value, o)) {
				return false;
			}
		}
		return true;
	},

	_get: function(name) {
		return this._validators[name] || $.makeArray(CssValidator.Validator[name]);
	}

});

//~CssValidator


CssValidator.Validator = {

	'background-alibaba-link': function(value, o) {
		var Validation = require('ui.Validation'),
			pattern = /url\(['"]?([^\)]+)['"]?\)/,
			match = pattern.exec(value);
		
		if (match && !Validation.Validator['alibaba-link'](match[1])) {
			o.message = '������ǰ���Ͱͼ���ͼƬ��ַ';
			return false;
		}
		return true;
	},

	'forbid-expression': function(ruleset, o) {
		var pattern = /expression\s*\(/,
			valid = true;	
		$.each(ruleset.styles, function(index, style) {
			if (pattern.test(style.value)) {
				o.node = style;
				o.message = '������ʹ��css���ʽ';
				valid = false;
				return false;
			}
		});
		return valid;
	}
};


return CssValidator;

});
