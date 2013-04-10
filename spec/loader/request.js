describe('request', function() {

	var request = loader.require('request');
	
	it('script', function() {
		var flag = false,
			url = '/spec/fixture/loader/request.js';
		request.script(url, {
			success: function() {
				flag = true;
			}
		});

		waitsFor(function() {
			return flag;
		});
	});


	it('css', function() {
		if (!window.jQuery) {
			request.script('http://code.jquery.com/jquery-1.9.1.min.js', {
				success: testRequestCss
			});
		} else {
			testRequestCss();
		}
	});

	var testRequestCss = function() {
		var flag = false,
			url = '/spec/fixture/loader/request.css',
			p = jQuery('<p>some text</p>').appendTo('body');

		expect(p.css('height')).not.toBe('100px');

		request.css(url, {
			success: function() {
				flag = true;
				expect(p.css('height')).toBe('100px');
				p.remove();
			}
		});

		waitsFor(function() {
			return flag;	
		});
	};

});
