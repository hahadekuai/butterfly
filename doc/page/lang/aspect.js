define(['jQuery', 'lang.Aspect', 'ui.Dialog'], function($, Aspect, Dialog) {

$('a.aspect-btn-alert').on('click', function(e) {
	e.preventDefault();	

	alert('Hello');
});

var aspect = new Aspect();

$('a.aspect-btn-before').on('click', function(e) {
	e.preventDefault();

	aspect.before(window, 'alert', function(o) {
		var text = o.args[0];
		return ['Before ' + text];
	});
});


$('a.aspect-btn-after').on('click', function(e) {
	e.preventDefault();

	aspect.after(window, 'alert', function(o) {
		var _alert = o.method,
			msg = o.args[0];

		_alert(msg + ' After');
	});
});

$('a.aspect-btn-around').on('click', function(e) {
	e.preventDefault();

	aspect.around(window, 'alert', function(o) {
		Dialog.info(o.args[0]);
	});
});


$('a.aspect-btn-detach').on('click', function(e) {
	e.preventDefault();	
	aspect.detach();
});
	

$('a.aspect-btn-attach').on('click', function(e) {
	e.preventDefault();	
	aspect.attach();
});


});
