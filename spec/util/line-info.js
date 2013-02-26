define('spec.util.LineInfo', 
	['jQuery', 'util.LineInfo'],

	function($, LineInfo) {

describe(this.id + ' - 计算文本内指定位置所在的行和列', function() {

	it('测试1', function() {
		var html = [
			'123456789',
			'123456789',
			'123456789',
			'123456789',
			'123456789'
		].join('\n');

		var li = new LineInfo(html);
		expect(li.locate(0)).toEqual([1, 1]);
		expect(li.locate(7)).toEqual([1, 8]);
		expect(li.locate(9)).toEqual([1, 10]);

		expect(li.locate(23)).toEqual([3, 4]);
		expect(li.locate(45)).toEqual([5, 6]);

		expect(li.locate(49)).toEqual([5, 10]);
	});
	
	it('测试2', function() {
		var lines = [
			'afasdfadjsfda  s1234567890',
			'12345678afda  sfas90',
			'12345678aaa  a90',
			'1adfaadffffff234  56  78aaaaaaaaaa90',
			'hello are me hrer',
			'hello are me hrer'
		];

		var li = new LineInfo(lines.join('\n')),
			pos = 0;

		$.each(lines, function(index, line) {
			for (var i = 0, c = line.length; i < c; i++) {
				expect(li.locate(pos)).toEqual([index + 1, i + 1]);
				pos++;
			}
			pos++;
		});

	});

});

});
