/**
 * app的延迟加载
 */
define(['jQuery', 'Log', 'PageContext', 'widget.LazyInitializer'], 

function($, Log, PageContext, LazyInitializer) {


var log = new Log('plugin.LazyLoad');

var LazyLoad = {

	init: function() {
		var self = this;

		this.doInit('body');

		// domready后，动态载入的app需要延迟加载
		site.on('domready-complete', function() {
			site.on('app-view-ready ui-lazy-load-bind', function(app) {
				self.doInit(app);	
			});
		});
		
		// 主动触发延迟加载, 依赖事件 ui-lazy-load-fire
		site.on('ui-lazy-load-trigger', function(div) {
			div = $(div);
			if (!div.length || div.data('lazyLoadTrigger')) {
				return;
			}
			div.data('lazyLoadTrigger', true);
			
			var tpls = $('textarea.lazy-load-template', div);
			tpls.each(function() {
				var fn = $(this).data('lazyLoadHandler');
				fn && fn();
			});
		});
	},

	doInit: function(div) {
		var self = this,
			tpls = $('textarea.lazy-load-template', div);

		tpls.each(function() {
			var tpl = $(this),
				proxy = tpl.prev('div.lazy-load-loading');
			
			if (!proxy.length) {
				proxy = $('<div>');
				tpl.before(proxy);
			}

			var fn = function() {
				self.initTpl(proxy, tpl);
			};
			tpl.data('lazyLoadHandler', fn);

			new LazyInitializer(proxy, fn);
		});
	},

	initTpl: function(proxy, tpl) {
		var html = tpl.val(),
			node = $(html),
			app = null,
			box = null;
		
		log.info('lazy load for ' + node);
		node.addClass('ui-lazy-load');
		
		proxy.replaceWith(node);
		tpl.remove();

		if (node.is('div[mod-box]')) {
			box = node;
			app = $('>div.mod', box);
		} else if (node.is('div[data-app]')) {
			app = node;
		}

		box && site.trigger('app-box-ready', box);
		app && site.trigger('app-view-ready', app);
	}

};

PageContext.add('plugin.LazyLoad', LazyLoad);

		
});
