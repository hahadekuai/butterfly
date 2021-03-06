butterfly.config({
	charset: 'gbk',
	root: '../js',
	path: {
		'doc/': './js/'
	}
});


define('!doc.Main', ['require', 'jQuery', 'Log',
		'../vendor/marked.js', '../vendor/mustache.js'], 
		
function(require, $, Log) {

var log = new Log('NavBar');

var Main = {

	init: function() {
		this.config();
		this.initBar();
		this.initPageLink();
		this.loadPage();
		this.backToTop();
	},

	config: function() {
		marked.setOptions({
			gfm: true,
			tables: true,
			pedantic: false,
			highlight: function(code, lang) {
				code = code.replace(/</g, '&lt;');
				code = code.replace(/>/g, '&gt;');
				code = code.replace(/[\t]/g, '    ').replace(/[ ]/g, '&nbsp;').replace(/\r|\n/g, '<br />')
				return prettyPrintOne(code, lang);
			}
		});
	},

	initBar: function() {
		var bar = $('div.navbar', '#header');

		require(['fx.Popup'], function(Popup) {
			var elms = $('li.dropdown', bar);
			elms.each(function() {
				new Popup($(this), {
					trigger: 'a.dropdown-toggle,ul.dropdown-menu',
					body: 'ul.dropdown-menu',
					hideDelay: 300
				});
			});
		});

		var lis = $('li', bar);
		bar.on('click', 'li', function() {
			lis.removeClass('active');
			$(this).addClass('active');
		});

	},

	initPageLink: function() {
		var self = this;
		$('body').on('click', 'a.page-link', function(e) {
			setTimeout($.proxy(self, 'loadPage'), 100);
		});
	},

	loadPage: function() {
		var self = this,
			container = $('#content'),
			parts = window.location.hash.substr(1).split(/\//g),
			page = parts[0] || 'home';

		$.ajax(page + '.htm', {
			type: 'get',
			dataType: 'html',
			cache: false,
			success: function(html) {
				if (!/^\s*</.test(html)) {
					html = marked(html);
				}
				container.html(html);
				prettyPrint();
				$('.script-aware', container).length && self.initPage(page);
			}
		});
	},

	initPage: function(page) {
		page = page.substr(0, 1).toUpperCase() + page.substr(1);
		require(['doc.page.' + page], function(Page) {
			Page.init();
		});
	},

	backToTop: function() {
		var link = $('a.back-to-top', '#footer');
		link.on('click', function(e) {
			e.preventDefault();	
			$(window).scrollTop(0);
		});
	}

};

$($.proxy(Main, 'init'));

});
