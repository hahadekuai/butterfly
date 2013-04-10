/**
 * placeholder组件
 * @author qijun.weiqj
 */
define('ui.PlaceHolder', ['jQuery', 'Class', 'Log'], function($, Class, Log) {

/**
 * new PlaceHoder(input, options);
 *
 * @param {jquery} input 输入框
 * @param {object} options 配置参数
 *	- placeholder 提示文案
 */

var log = new Log('widget.PlaceHolder');


var handle = function(input, options) {
	if (!input.is('input:text,textarea')) {
		log.warn('invalid input:text for PlaceHodler ' + input);
		// TODO 组件有些地方用错了,在非input:text上都调用了此方法
		return;
	}

	var placeholder = input.data('placeholder') || options.placeholder || options || '',
		label = $('<div class="ui-placeholder-label" style="position: absolute; width: 0; height: 0; color: #bfbfbf;">' +
			'<div class="value" style="position: absolute; padding-left: 4px;">' + placeholder + '</div></div>');
	
	input.addClass('ui-placeholder').before(label);

	prepare(input, label);

	input.on('blur', function() {
		if (/^\s*$/.test(input.val())) {
			label.show();
			input.addClass('ui-placeholder-on');
		}
	});

	input.on('focus', function() {
		if (input.hasClass('ui-placeholder-on')) {
			label.hide();
			input.removeClass('ui-placeholder-on'); 
		}
	});

	label.on('click', function() {
		input.trigger('focus');
	});

	input.on('placeholder-refresh', function() {
		prepare(input, label);
		input.triggerHandler('blur');
	});

	input.triggerHandler('blur');
};


var prepare = function(input, label) {
	label.show();

	var off1 = input.offset(),
		padding = parseInt(input.css('padding-top'), 10) || 0,
		off2 = label.offset(),
		value = $('div.value', label),
		height = input.is('textarea') ? parseInt(input.css('line-height'), 10) : input.height();
	
	value.css({
		'padding-top': padding + 'px',
		left: (off1.left - off2.left) + 'px',
		top: (off1.top - off2.top) + 1 + 'px',
		width: input.width() + 'px',
		height: height + 'px',
		'line-height': height + 'px'
	});

	label.hide();
};


return function(input, options) {
	options = options || {};	
	$(input).each(function() {
		handle($(this), options);	
	});
};


});

