define('spec.util.HtmlParser', 
	['jQuery', 'util.HtmlParser'],

	function($, Parser) {

describe(this.id + ' - ���ڽ���HTML', function() {

	it('����ע��', function() {
		var o = Parser.parse('<!--hello-->'),
			result = o.result;

		expect(o.success).toBeTruthy();
		expect(result[0].type).toBe('comment');
		expect(result[0].body).toBe('hello');
	});

	it('�����ı�', function() {
		var o = Parser.parse('hello is an word');
		expect(o.result[0].type).toBe('text');
		expect(o.result[0].body).toBe('hello is an word');
	});

	it('����Ԫ��', function() {
		var o = Parser.parse('<div />'),
			node = o.result[0];
		expect(node.type).toBe('element');
		expect(node.name).toBe('div');
		expect(node.enclose).toBeTruthy();
	});

	it('��������', function() {
		var o = Parser.parse('<img width="100" height="100" />')	
		var node = o.result[0];
		expect(node.name).toBe('img');

		var attrs = node.attributes;
		expect(attrs[0].name).toBe('width');
		expect(attrs[0].value).toBe('100');

		expect(attrs[1].name).toBe('height');
		expect(attrs[1].value).toBe('100');
	});

	it('���������ݵ�tag', function() {
		var o = Parser.parse('<div>Hello</div>');

		var node = o.result[0];
		expect(node.name).toBe('div');

		var body = node.body[0];
		expect(body.type).toBe('text');
		expect(body.body).toBe('Hello');
	});

	it('����Ƭ��', function() {
		var html = [
			'<div>',
				'<input type="text" />',
				'<img src="123.png" />',
				'<img src="123.png" >',
				'<input type="text">',
				'<!-- some comment -->',
				'<div>',
					'<div>hello</div>',
				'</div>',
			'</div>'
		].join('\n');	

		var o = Parser.parse(html);
	});

	it('��������һ��ı�ǩ', function() {
		var o = Parser.parse('< div id = " hello " > Hi This Is < / div >');

		var node = o.result[0];
		expect(node.name).toBe('div');

		var attr = node.attributes[0];
		expect(attr.name).toBe('id');
		expect(attr.value).toBe('hello');
		
		var text = node.body[0];
		expect(text.type).toBe('text');
		expect(text.body).toBe(' Hi This Is ');
	});
});

});
