define('spec.util.CssParser', 
	['jQuery', 'util.CssParser'],

	function($, Parser) {

describe(this.id + ' - 用于解析Css', function() {

	it('解析CSS', function() {
		var css = [
				'.test {',
				'	font-size: 12px;',
				'	background: #000;',
				'}',
				'div {',
				'	text-align: center;',
				'	z-index: 1000',
				'}'
			].join('\n'),

			o = Parser.parse(css);

		expect(o.success).toBeTruthy();

		var rulesets = o.result;
		expect(rulesets.length).toBe(2);

		var rs = rulesets[0];
		expect(rs.selector).toBe('.test');

		expect(rs.styles[1].property).toBe('background');
		expect(rs.styles[1].value).toBe('#000');
	});

});

});
