define('spec.util.ParserModule', 
	['jQuery', 'Class', 'util.ParserModule'],

	function($, Class, ParserModule) {

describe(this.id + ' - ֧��Parser�ı�д', function() {

	it('minin ParserModule��Parser������һЩ��������', function() {
		expect(typeof Parser.parse).toBe('function');
		
		$.each(['_check', '_until', '_skip', '_error'], function(index, method) {
			expect(typeof Parser.prototype[method]).toBe('function');
		});
	});

	it('_check ��ͨ�ַ���', function() {
		var parser = new Parser('   hello');
		expect(parser._check('hello')).toBeTruthy();
	});

	it('_check ������ʽ', function() {
		var parser = new Parser(' 123456 abc ');
		expect(parser._check('\\d')).toBeTruthy();
		expect(parser._check('\\[a-z]')).toBeFalsy();
	});

	it('_skip ��ͨ�ַ���', function() {
		var parser = new Parser('123456');	
		expect(parser.pos).toBe(0);
		parser._skip('123');
		expect(parser.pos).toBe(3);
	});

	it('_skip ������ʽ', function() {
		var parser = new Parser('123456');	
		expect(parser.pos).toBe(0);
		parser._skip('\\d{3}');
		expect(parser.pos).toBe(3);
	});

	it('_until default', function() {
		var body = ' 123456 < 123456',
			parser = new Parser(body),
			str = parser._until('<');

		expect(str).toBe('123456');
		expect(parser.pos).toBe(body.indexOf('<'));
	});

	it('_until notrim', function() {
		var body = ' hello 123 <',
			parser = new Parser(body),
			str = parser._until('<', true);

		expect(str).toBe(' hello 123 ');
		expect(parser.pos).toBe(body.indexOf('<'));
	});

	var Parser = new Class({
		init: function(body) {
			this.body = body;	
			this.pos = 0;
		}
	});
	ParserModule.mixin(Parser);
});

});
