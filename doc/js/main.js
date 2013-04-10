(function() {

var docroot = window.location.href;
docroot = docroot.replace(/#.*$/, '');
docroot = docroot.replace(/\?.*/, '');
docroot = docroot.replace(/[^\/]+\.htm/, '');

may.config({
	root: 'http://wpstatic.china.alibaba.com/js',
	path: {
		'vendor': docroot + 'vendor',
		'page':  docroot + 'js/page'
	}
});

})();
