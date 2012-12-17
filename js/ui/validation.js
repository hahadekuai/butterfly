/**
 * 简单表单验证组件
 * @author qijun.weiqj 
 */
define('ui.Validation', ['require', 'jQuery', 'Class', 'Log', 'widget.FormUtil'], 

function(require, $, Class, Log, FormUtil) {

var log = new Log('ui.Validation');

var Validation = new Class({
	
	/**
	 * 构造一个验证器, 用于验证一个表单控件
	 * @param {jquery} elm 表单元素
	 * @param {array} config 验证规则 
	 *  {
	 *		advice: {string} 出错提示方式
	 *		handler: {string} 处理方式
	 *		rules: [
	 *			{
	 *				type: {string} 验证器名称
	 *				value: {string|array|object} 验证器参数
	 *				message: {string} 出错信息
	 *			}
	 *		]
	 *	}
	 */
	init: function(elm, config) {
		elm = $(elm);
		if (elm.length > 1) {
			return this._createGroup(elm, config);
		}

		elm.length === 1 || log.error('empty element for validation');
		this.elm = elm;	
		
		config = config || {};
		this.config = config.rules ? config : { rules: config };

		this.advice = this._createAdvice();
		this.handler = this._get('Handler', this.config.handler);
		
		this.handler(this.elm, $.proxy(this, 'validate'), this.advice);
		
		this.enable = true;
		this.rule = {};
	},

	_createGroup: function(elms, config) {
		var vs = [];	
		elms.each(function(i) {
			vs[i] = new Validation(this, config);
		});

		return {
			validate: function(noAdvice) {
				for (var i = 0, c = vs.length; i < c; i++) {
					if (!vs[i].validate(noAdvice)) {
						return false;
					}
				}
				return true;
			}
		};
	},

	_createAdvice: function() {
		var self = this,
			advice = this._get('Advice', this.config.advice);
		return {
			prompt: function() {
				advice.prompt && advice.prompt(self.elm, self.rule);	
			},
			success: function() {
				advice.success && advice.success(self.elm, self.rule);	
			},
			error: function() {
				advice.error && advice.error(self.elm, self.rule);
			}
		};
	},

	validate: function(noAdvice) {
		if (!this.enable) {
			return true;
		}

		var self = this,
			value = $.trim(this.elm.val()),
			advice = this.advice,
			rules = $.makeArray(this.config.rules),
			valid = true;

		$.each(rules, function(index, rule) {
			if (!$.isPlainObject(rule)) {
				rule = { type: rule };
			}
			self.rule = rule;

			valid = self._validate(value, rule);
			if (!valid) {
				return false; // break
			}
		});

		noAdvice || advice[valid ? 'success' : 'error']();

		return valid;
	},

	setEnable: function(enable) {
		this.enable = !!enable;	
		this.enable || this.advice.prompt();
	},

	_validate: function(value, rule) {
		var type = rule.type;	
		// require
		if (type === 'require') {
			return !!value;
		}

		// other empty
		if (type !== 'require' && !value && !rule.force) {
			return true;
		}

		var validate = this._get('Validator', type);
		if (!validate) {
			log.error('validator ' + type + ' not exist');
			return false;
		}

		return validate.test ? validate.test(value, rule.value) :
				validate(value, rule.value);
	},


	_get: function(type, name) {
		name = name || 'default';
		name = typeof name === 'string' ? Validation[type][name] : name;
		name || log.warn('module not exist for ' + type + ':' + name);
		return name;
	}
  
});


Validation.Handler = {

	'default': function(elm, validate, advice) {
		elm.on('focus', function() {
			advice.prompt();
		});

		elm.on('blur', function() {
			validate();	
		});
	},
	
	instant: function(elm, validate) {
		elm.on('input propertychange', function() {
			var input = $(this),
				last = input.data('validationValue') || '',
				value = $.trim(input.val());
			
			if (validate()) {
				input.data('validationValue', value);
			} else {
				// 延迟设置已防止再次触发input/propertychange, 以造成堆栈溢出
				setTimeout(function() {
					input.val(last);
				}, 50);
			}
		});

		elm.triggerHandler('input');
	}
	
};


Validation.Advice = {
	'default': {
		prompt: function(elm, rule) {
			FormUtil.alert(elm, rule.promptMessage, 'prompt');
		},

		success: function(elm, rule) {
			FormUtil.alert(elm, rule.successMessage, 'success');
		},

		error: function(elm, rule) {
			FormUtil.alert(elm, rule.message || rule.errorMessage, 'error');
		}
	}
	
};


Validation.Validator = {
	
	price: function(v) {
		return /^[\d]{0,9}(\.[\d]{0,2})?$/.test(v);
	},

	pattern: function(v, pattern) {
		return new RegExp(pattern).test(v);
	},

	'not-pattern': function(v, pattern) {
		pattern = typeof pattern === 'string' ?	new RegExp(pattern) : pattern;
		return !pattern.test(v);
	},

	maxlength: function(v, maxlength) {
		return v.length <= parseInt(maxlength, 10);
	},

	range: function(v, options) {
		options = options || [];	
		if (!/^\d+(\.\d+)?$/.test(v)) {
			return false;
		}

		var min = options[0] ? parseFloat(options[0]) : Number.MIN_VALUE,
			max = options[1] ? parseFloat(options[1]) : Number.MAX_VALUE;

		v = parseFloat(v);
		return min <= v && v <= max;
	},

	custom: function(v, module) {
		require(module, function(validator) {
			return validator(v);
		});
	},

	'alibaba-link': function(url) {
		var list = null;

		if (!Validation.Validator._whiteList) {
			list = [
				'alibaba.com',
				'alibaba.cn',
				'alibaba.com.cn',
				'taobao.com',
				'taobao.cn',
				'taobao.com.cn',
				'taobao.net',
				'taobaocdn.com',
				'taobaocdn.net',
				'tbcdn.cn',
				'alipay.com',
				'alipay.com.cn',
				'alipay.net',
				'zhifubao.com',
				'zhifu.com',
				'aliexpress.com',
				'1688.com',
				'1688.com.cn',
				'1688.cn',
				'yahoo.cn',
				'yahoo.com.cn',
				'alisoft.com',
				'alisoft.cn',
				'alisoft.com.cn',
				'alimama.com',
				'alimama.cn',
				'alimama.com.cn',
				'koubei.com',
				'koubei.cn',
				'koubei.com.cn',
				'aliimg.com',
				'aliimg.net',
				'aliimg.com.cn',
				'alixueyuan.net',
				'alibado.com',
				'alibaba-inc.com',
				'aliloan.com'	
			];

			Validation.Validator._whiteList = $.map(list, function(item) {
				var pattern = '^http[s]?://([^/]+\\.)?' + item.replace(/\./g, '\\.') + '(/|$)';
				return new RegExp(pattern, 'i');
			});
		}

		list = Validation.Validator._whiteList;
		for (var i = 0, c = list.length; i < c; i++) {
			if (list[i].test(url)) {
				return true;
			}
		}
		return false;

	}
};



return Validation;

});
