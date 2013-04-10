define('spec.lang.Class', ['Class'], function(Class) {

describe(this.id, function() {


it('����һ����', function() {
	var A = new Class({
		init: function(name) {
			this.name = name;	
		},

		say: function(prefix) {
			return prefix + ' ' + this.name;
		}
	});

	var a1 = new A('lilei');
	expect(a1.name).toBe('lilei');
	expect(a1.say('hi')).toBe('hi lilei');

	var a2 = new A('hanmeimei');
	expect(a2.name).toBe('hanmeimei');
	expect(a2.say('hello')).toBe('hello hanmeimei');
});

it('ʹ��initialize���캯��Ҳ����', function() {
	var A = new Class({
		initialize:	function(name) {
			this.name = name;	
		}
	});

	var a = new A('hello');
	expect(a.name).toBe('hello');
});


it('֧�ּ򵥵ļ̳�', function() {
	var P = new Class({
		say: function(num) {
			return num;
		}
	});

	var M = new Class(P, {
		add: function(a, b) {
			return a + b;	
		}
	});

	var m = new M();
	var ret = m.add(m.say(100), m.say(200));
	expect(ret).toBe(300);
});


});
//~ describe

});
