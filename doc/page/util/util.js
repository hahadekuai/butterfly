define(['jQuery', 'util.Util'], function($, Util) {

	$('a.formatUrl').on('click',function(e){
		e.preventDefault();

		var result = Util.formatUrl('http://wpstatic.china.alibaba.com/doc/index.htm',{"a":"b"});
		$('div.formatUrl-result').html(result);
	});

	var scheduleNumber = 0;
	$('a.schedule').on('click',function(e){
		e.preventDefault();
		
		Util.schedule('test',function(){
			scheduleNumber++;
			$('div.schedule-result').html(scheduleNumber);
		},2000);

	});

	$('a.toCamelString').on('click',function(e){
		e.preventDefault();
				
		var result = Util.toCamelString('aaa-bbb-ccc');
		$('div.toCamelString-result').html(result);
	});

	$('a.toPascalString').on('click',function(e){
		e.preventDefault();
				
		var result = Util.toPascalString('aaa-bbb-ccc');
		$('div.toPascalString-result').html(result);
	});
});
