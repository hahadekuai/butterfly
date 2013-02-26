/**
 * 用于验证Html符合一定的业务规则
 * @author qijun.weiqj
 */
define('util.HtmlValidator', ['jQuery', 'Class'], 

function($, Class) {

var Validator = new Class({
	/**
	 * {
	 *	element: {function},
	 *	text: {function}
	 * }
	 */
	init: function(rule) {
		this.rule = rule || {};	
	},

	validate: function(nodes) {
		var self = this,
			rule = this.rule;

		for (var i = 0, c = nodes.length; i < c; i++) {
			var node = nodes[i],
				v = rule[node.type];

			if (v && !v(node)) {
				return false;
			}

			if (node.type === 'element') {
				if (node.attributes.length && rule.attribute &&
						!this._validateAttrs(node.attributes, rule.attribute)) {
					return false;
				}
				if (node.body.length && !this.validate(node.body)) {
					return false;
				}
			}
		}

		return true;
	},

	_validateAttrs: function(attrs, v) {
		for (var i = 0, c = attrs.length; i < c; i++) {
			if (!v(attrs[i])) {
				return false;
			}
		}
		return true;
	}

});

return Validator;


});
