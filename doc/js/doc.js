define('Doc', 
		['jQuery', 'vendor.Mustache', 'vendor.marked'], 
		function($, Mustache, marked) {

return {
	init: function() {
		var parts = window.location.hash.substr(1).split(/\//g),
			group = parts[1],
			page = parts[2];

		this.renderTemplate(group, page);
		this.loadPage(group, page);
		
		marked.setOptions({
			gfm: true,
			pedantic: false,
			highlight: function(code, lang) {
				code = code.replace(/[\t]/g, '    ').replace(/[ ]/g, '&nbsp;').replace(/\r|\n/g, '<br />')
				return prettyPrintOne(code, lang);
			}
		});
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
			url = 'page/' + group + '/' + page + '.htm';

		$.ajax(url, {
			type: 'get',
			cache: false,
			dataType: 'html',
			success: function(html) {
				elm.html(marked(html));
			}
		});
	},

	getAlias: function(s) {
		return s.replace(/([A-Z])/g, function(m) {
			return '-' + m.toLowerCase();
		}).replace(/^-/, '');
	},

	data: {
		lang: ['loader', 'class', 'log', 'context'],
		ui: ['Widget', 'FileUploader'],
		fx: ['tab', 'roll', 'popup', 'accordion', 'countdown']
	}
};
		
});
