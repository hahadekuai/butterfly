define('spec.util.HtmlValidator', 
	['jQuery', 'util.HtmlParser', 'util.HtmlValidator'],

	function($, Parser, Validator) {

describe(this.id + ' - ������֤Html����һ����ҵ�����', function() {
	
	it('��ֻ֤�ܰ���ָ���Ľڵ�', function() {
		var nodes = Parser.parse('<div><img /></div><div></div>').result;

		var v = new Validator({
			element: function(node) {
				return $.inArray(node.name, ['div', 'img']) !== -1;
			}
		});

		expect(v.validate(nodes)).toBeTruthy();

		var nodes = Parser.parse('<div><img /><input/></div><div></div>').result;
		expect(v.validate(nodes)).toBeFalsy();
	});

	it('��֤����', function() {
		var nodes = Parser.parse('<div width="12" height="13"></div>').result;
		var v = new Validator({
			attribute: function(attr) {
				return $.inArray(attr.name, ['width', 'height']) !== -1;
			}
		});

		expect(v.validate(nodes)).toBeTruthy();

		var nodes = Parser.parse('<div width="12" height="13" other="234"></div>').result;
		expect(v.validate(nodes)).toBeFalsy();
	});

});

});
