define('page.Doc', 
		['jQuery', 'ui.Autowire', 'vendor.Mustache', 'vendor.marked'], 
		function($, Autowire, Mustache, marked) {

return {
	init: function() {
		var parts = window.location.hash.substr(1).split(/\//g),
			group = parts[1],
			page = parts[2];

		this.renderTemplate(group, page);
		this.loadPage(group, page);
	},

	renderTemplate: function(group, page) {
		var self = this,
			list = [],
			items = this.data[group] || [];

		$.each(items, function(index, name) {
			var alias = self.getAlias(name);
			list.push({
				active: page === alias,
				group: group,
				name: name,
				alias: alias
			});
		});

		var o = {
			list: list
		};

		var tpls = $('script[type="text/template"]', 'body');

		tpls.each(function() {
			var tpl = $(this),
				html = tpl.html();
			
			html = Mustache.render(tpl.html(), o);	
			tpl.replaceWith(html);
		});	
	},

	loadPage: function(group, page) {
		var elm = $('div.doc-container', '#content'),
			div = $('<div>').appendTo(elm),
			url = 'page/' + group + '/' + page + '.htm';

		$.ajax(url, {
			type: 'get',
			cache: false,
			dataType: 'html',
			success: function(html) {
				div.html(marked(html));
				new Autowire(div);
			}
		});
	},

	getAlias: function(s) {
		return s.replace(/([a-z])([A-Z])/g, function(m, m1, m2) {
			return m1 + '-' + m2;
		}).toLowerCase();
	},

	data: {
		lang: ['loader', 'Class', 'Log', 'Context', 'Aspect'],
		util: ['Util', 'AddFavorite', 'ParserModule', 'HtmlParser', 'CssParser', 'LineInfo', 'CssValidator'],
		dpl: ['index', 'layout', 'mod', 'button', 'paging', 'crumbs', 'tips', 'form', 'tabs', 'dialog', 'imagetext', 'table', 'other'],
		ui: ['UI', 'Widget', 'PlaceHolder', 'ColorChooser', 'FileUploader'],
		fx: ['Effect', 'Tabs', 'Roll', 'Popup', 'Accordion', 'CountDown', 'Marguee']
	}
};
		
});
