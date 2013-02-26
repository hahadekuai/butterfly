/**
 * 添加到收藏夹
 * @author qijun.weiqj
 */
define('util.AddFavorite', ['jQuery', 'util.Util'], function($, Util) {

var addFacorite = function(title, url) {
	Util.tryThese(
		function() {
			window.sidebar.addPanel(title, url, '');
		}, 
		
		function() {
			window.external.AddFavorite(url, title);
		},

		function() {
			window.external.addToFavoritesBar(url, title);
		},

		function() {
			window.alert('浏览器不支持该操作，尝试快捷键 Ctrl + D');	
		}
	);
};
	

return function(node, config) {
	config = config || {};
	var title = config.title || document.title,
		url = config.url || window.location.href;

	node.on('click', function(e) {
		if ($(this).is('a')) {
			e.preventDefault();
		}
		addFacorite(title, url);
	});

};
		
});
