define(['jQuery', 'ui.ColorChooser'], function($, ColorChooser) {

var box = $('div.box', 'div.color-chooser-demo');

box.on('click', function() {
	new ColorChooser(box, {
		value: '#ff0000',
		transparent: true,
		confirm: function(o) {
			box.css('background', o.color);
		}
	});
});
	
		
});
