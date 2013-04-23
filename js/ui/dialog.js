/**
 * 对话框
 *
 * @author qijun.weiqj
 */
define('ui.Dialog', ['jQuery', 'Class'], 

function($, Class) {

var Dialog = new Class({
  
	/**
	 * @param {object} config 对话框配置信息
	 *	- center		{boolean}		是否居中对齐对对话框, 默认为true
	 *	- closable		{boolean}		有无关闭按扭, 默认为true
	 *	- draggable: { handle: selector } 是否可拖动, 以及拖动handler
	 *	- content		{string}		对话框内容
	 *	- buttons: [ { name: {string}, text: {string} } ]
	 *  - showHeader	{boolean}		是否显示头部, 默认情况下如果有title就会显示header
	 *  - title			{string}		显示标题
	 *  - showFooter	{boolean}		是否显示底部，默认情况下根据是否有buttons来决定是否显示footer
	 *
	 *  - className		{string}		添加到dialog节点的class, 可以使用它定义dialog的样式
	 *  - width			{number}		对话框宽度		
	 *  - height		{number}		异步加载时,对话框初始高度, 用于改善交互
	 *  - forceHeight	{boolean}		默认情况下, height仅仅是对话框打开时的高度，后来内容载入后就会自定义的
	 *			如果设置forceHeight, 则会设置d-content的高度
	 *
	 *  - loader	{function(html)} 内容载入器
	 *  - beforeOpen {function(dialog)}	打开窗口前触发, 返回false阻上对话框打开
	 *  - beforeClose {function(dialog)} 关闭窗口时前触发，可以做一些清理工作
	 *  - contentSuccess {function(dialog)}	内容载入完成时触发（已更新到对话框节点中，可以操作DOM了）
	 *
	 *
	 */
	init: function(config) {
		this.config = this.__prepare(config);
		this.$renderTemplate($.proxy(this, '__openDialog'));
	},

	__prepare: function(config) {
		var config = this.$prepare(config);

		config = $.extend({
			center: true,
			closable: true,
			draggable: true,
			content: Dialog._loadingTemplate,
			buttons: [
				{ name: 'submit', text: '确定' }
			]
		}, config);

		config.showHeader = !!config.title;
		config.showFooter === undefined &&
			(config.showFooter = !!config.buttons.length);

		return config;			
	},

	/**
	 * $带头的方法 相当于"protected", 可由子类重写
	 */
	$prepare: function(config) {
		return config;
	},

	$renderTemplate: function(callback) {
		var config = this.config,
			tpl = Dialog._compiledTemplate;
		if (tpl) {
			callback(tpl.applyData(config));
			return;
		}
		$.use('web-sweet', function() {
			tpl = Dialog._compiledTemplate = FE.util.sweet(Dialog._template);
			callback(tpl.applyData(config));
		});
	},

	__openDialog: function(html) {
		var self = this,
			config = this.config,
			node = null,
			use = ['ui-dialog'];
				
		node = this.node = $('<div>').html(html);
		this.$configNode(node);

		if (config.beforeOpen && config.beforeOpen(this) === false) {
			return;
		}

		config.draggable && use.push('ui-draggable');

		$.use(use, function() {
			node.dialog(self.$getDialogConfig());
			self.__handleEvents();

			if (config.loader) {
				self.__loadContent();
			} else {
				self.__contentSuccess();
			}
		});
	},

	$configNode: function(node) {
		var config = this.config;

		node.addClass('site-dialog');
		config.className && node.addClass(config.className);

		config.width && $('div.d-body', node).css('width', config.width + 'px');

		if (config.height) {
			$('div.d-content div.d-loading', node).css({
				height: config.height + 'px',
				'line-height': config.height + 'px'
			});

			config.forceHeight && $('div.d-content', node).css('height', config.height);
		}
		
	},

	$getDialogConfig: function() {
		var self = this,
			config = this.config,
			ret = {
				shim: true,
				center: config.center
			},
			draggable = config.draggable;

		if (draggable) {
			ret.draggable = $.isPlainObject(draggable) ?
					draggable : { handle: 'div.d-header' };
		}

		if (config.beforeClose) {
			ret.beforeClose = function() {
				return config.beforeClose(self);
			};
		}

		return ret;
	},

	__handleEvents: function() {
		this.__handleBtnEvents();
		this.__handleDefaultEvent();
	},

	__handleBtnEvents: function() {
		var self = this,
			config = this.config,
			div = $('div.d-footer div.d-btn-group', this.node),
			close = config.close || config.cancel;

		$('div.d-header a.d-close', this.node).on('click', function(e) {
			e.preventDefault();
			close ? close.call(config, self) : self.__close();
		});
		
		this.__handleActions($('a.d-btn', div));
	},

	__handleActions: function(elms) {
		var self = this,
			config = this.config;
		
		elms.on('click', function(e) {
			var action = $(this).data('action'),
				ret = config[action] ? config[action](self) : self.__close();

			if (!ret) {
				e.preventDefault();	
			}
		});
	},

	__handleDefaultEvent: function() {
		var self = this,
			btn = $('div.d-footer div.d-btn-group a.d-btn-default', this.node);

		if (!btn.length) {
			return;
		}

		this.__defaultEventHandler = function(e) {
			if (e.keyCode === 13) {
				btn.trigger('click');
				return false;
			}
		};

		$(document).on('keydown', this.__defaultEventHandler);
	},

	__loadContent: function(data) {
		var self = this,
			loader = this.config.loader;

		loader(function(html) {
			self.setContent(html);
			self.__contentSuccess(true);
		}, data);
	},

	__contentSuccess: function(async) {
		var self = this,
			config = this.config;
		
		// 异步, 没有设置高度 则需要居中对话框
		if (!this._centered && async && !config.height) {
			this.center();
			this._centered = true;
		}

		var actions = $('a[data-action],button[data-action]', this.getContainer());
		actions.length && this.__handleActions(actions);

		if (!config.contentSuccess) {
			return;
		}
		
		// ie6下异步加载内容后如果直接调用方法会被打断
		// 所以使用setTimeout延迟
		$.util.ua.ie6 ? setTimeout(function() {
			config.contentSuccess(self);	
		}, 0) : config.contentSuccess(this);

		site.trigger('ui-dialog-open', this);
	},

	center: function() {
		var win = $(window),
			div = this.node.closest('div.ui-dialog'),
			left = (win.width() - div.width()) / 2,
			top = (win.height() - div.height()) / 2;
		
		top = win.scrollTop() + top;	
		div.css({ left: left, top: top > 0 ? top : 0 });
	},

	getContainer: function() {
		if (!this.__container) {
			this.__container = $('div.d-content', this.node);
		}
		return this.__container;
	},

	reload: function(data) {
		return this.__loadContent(data);	
	},

	setTitle: function(title) {
		$('d-header h3', this.node).text(title);	
	},

	setContent: function(html) {
		html = html === false ? Dialog._loadErrorTemplate : html;	
		var container = this.getContainer();
		if (typeof html === 'string') {
			container.html(html);	
		} else {
			container.empty().append(html);
		}
	},

	close: function() {
		this.__defaultEventHandler &&
				$(document).off('keydown', this.__defaultEventHandler);
		return this.node.dialog('close');
	},

	__close: function() {
		if (this.__loading) {
			return; 
		}
		this.close();
	},

	submit: function() {
		this.config['confirm'] && this.config['confirm'](this); 
	},

	showLoading: function(msg) {
		var self = this,
			footer = $('div.d-footer', this.node),
			loading = $('div.d-loading', footer),
			group = $('div.d-btn-group', footer);
		
		if (msg === false) {
			loading.addClass('fd-hide');
			group.removeClass('fd-hide');
			this.__loading = false;
		} else {
			loading.html(msg).removeClass('fd-hide');
			group.addClass('fd-hide');
			this.__loading = true;
		}
	}
  
});
//~

$.extend(Dialog, {
	
	open: function(options) {
		return new Dialog(options);
	},

	error: function(msg, title, options) {
		this._open(msg, title, 'error', options);
	},

	warn: function(msg, title, options) {
		this._open(msg, title, 'warn', options);
	},

	info: function(msg, title, options) {
		this._open(msg, title, 'info', options);
	},

	confirm: function(msg, title, options) {
		if ($.isPlainObject(title)) {
			options = title;
			title = null;
		}

		options = options || {};

		this._open(msg, title, 'confirm', $.extend({
			className: 'site-dialog-common',
			buttons: [
				{ name: 'confirm', text: options.confirmText || '确定' },
				{ name: 'cancel', text: '取消' }
			]
		}, options));
	},

	_open: function(msg, title, type, options) {
		if ($.isPlainObject(title)) {
			options = title;
			title = null;
		}
		
		title = title || ({
			error: '错误',
			warn: '警告'
		}[type]) || '提示'

		options = options || {};

		new Dialog($.extend({
			title: title,
			content: '<div class="d-alert d-alert-' + (options.icon || type) + '"><i></i>' + msg + '</div>'
		}, options));
	},

	_loadingTemplate: '<div class="d-loading">正在加载...</div>',

	_loadErrorTemplate: '<div class="d-error">网络繁忙，请刷新后重试</div>',

	_template: 
'<div class="d-body fd-clr">\
	<% if (showHeader) { %>\
	<div class="d-header">\
		<h3><%= title %></h3>\
		<% if (closable) { %>\
		<a class="d-close" href="#"></a>\
		<% } %>\
	</div>\
	<% } %>\
	<div class="d-content">\
		<%= content %>\
	</div>\
	<% if (showFooter) { %>\
	<div class="d-footer">\
		<div class="d-loading fd-hide"></div>\
		<div class="d-btn-group">\
			<% foreach (buttons as button) { %>\
			<% if (button.name === "cancel" ) { %>\
			<% var cn = "d-btn ui-btn d-btn-" + button.name; %>\
			<% } else { %>\
			<% var cn = "d-btn ui-btn ui-btn-primary d-btn-" + button.name; %>\
			<% } %>\
			<% cn = button["default"] ? cn + " d-btn-default" : cn; %>\
			<a href="<%= (button.url || "#") %>" target="<%= (button.target || "_self") %>" class="<%= cn %>" data-action="<%= button.name %>"><span><%= button.text %></span></a>\
			<% } %>\
		</div>\
	<% } %>\
	</div>\
</div>'

});

return Dialog;

		
});
