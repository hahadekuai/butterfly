/**
 * 定义设计师可以使用的css属性
 * 
 * @author yefei.niuf
 */
define('util.CssValidatorPropertiesFilter', ['jQuery', 'util.CssValidator'], 

function($, CssValidator) {

var props = [
    'color',
    'font',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'line-height',
    'vertical-align',
    'text-align',
    'text-decoration',
    'text-indent',
	'word-break',
	'word-wrap',
    'background',
    'background-color',
    'background-image',
    'background-repeat',
    'background-position',
    'background-attachment',
    'height',
    'width',
    'top',
    'right',
    'bottom',
    'left',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border',
    'border-top',
    'border-right',
    'border-bottom',
    'border-left',
    'border-width',
    'border-color',
    'border-style',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'display',
    'float',
    'clear',
    'overflow',
    'overflow-x',
    'overflow-y',
    'position',
    'visibility',
    'list-style',
    'list-style-image',
    'list-style-position',
    'list-style-type',
    'opacity',
    'z-index',
    'cursor',
	'filter',
    'zoom',
    'border-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'box-shadow'
];

CssValidator.Validator['properties-filter'] = function(ruleset) {
	var valid = true;
	$.each(ruleset.styles || [], function(index, style) {
		if ($.inArray(style.property, props) === -1) {
			valid = false;
			return false;
		}
	});
	return valid;
};

return props;

});
