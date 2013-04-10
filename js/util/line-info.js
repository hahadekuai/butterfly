/**
 * 从位置得到行列信息
 * @author qijun.weiqj
 */
define('util.LineInfo', ['jQuery', 'Class'], function($, Class) {

var LineInfo =  new Class({
	
	init: function(body) {
		var lines = body.split(/\n/g),
			pos = 0,
			info = [];
		
		$.each(lines, function(index, line) {
			pos += (line.length + 1);
			info.push(pos);
		});

		this.info = info;
	},

	locate: function(pos) {
		var info = this.info,
			line = 0, 
			col = 0;	
		
		$.each(info, function(index, now) {
			if (pos < now) {
				line = index;
				col = index > 0 ? pos - info[index - 1] : pos;
				return false;
			}
		});

		return [line + 1, col + 1];
	}
		
});

LineInfo.locate = function(html, pos) {
	return new LineInfo(html).locate(pos);
};

return LineInfo;
	
		
});
