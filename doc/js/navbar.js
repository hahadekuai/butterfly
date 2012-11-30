define(['require', 'jQuery', 'Log', 'PageContext', 'ui.Factory'], 
function(require, $, Log, PageContext, Factory) {

var log = new Log('NavBar');
	
var NavBar = {

	init: function() {
		this.initBar();
		this.initPageLink();
		this.loadPage();
		this.backToTop();
	},

	initBar: function() {
		var bar = $('div.navbar', '#header');
		new Factory(bar, {
			widgetId: 'fx.Popup',
			itemSelector: 'li.dropdown',

			trigger: 'a.dropdown-toggle',
			content: 'ul.dropdown-menu'
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
				container.html(html);
				$('.script-aware', container).length && self.initPage(page);
			}
		});
	},

	initPage: function(page) {
		page = page.substr(0, 1).toUpperCase() + page.substr(1);
		require([page], function(Page) {
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


PageContext.add('navbar', NavBar);
	
});
