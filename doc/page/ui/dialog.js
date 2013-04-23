define(['jQuery', 'ui.Dialog'], function($, Dialog) {
	$('a.democommon').on('click',function(e){
		e.preventDefault();

		new Dialog({
			title:'tip',
			content:'just a test',
			buttons:[{
			    'name': 'confirm',
			    'text': 'confirm'
			},{
			    'name': 'cancel',
			    'text': 'cancel'
			}]
		});
	});


	$('a.dialoginfo').on('click',function(e){
		e.preventDefault();

		Dialog.info('a info demo', 'title');
	});

	$('a.dialogwarn').on('click',function(e){
		e.preventDefault();

		Dialog.warn('a warn demo', 'title');
	});

	$('a.dialogerror').on('click',function(e){
		e.preventDefault();

		Dialog.error('a error demo', 'title');
	});
	
	$('a.dialogconfirm').on('click',function(e){
		e.preventDefault();

		Dialog.confirm('a confirm demo', 'title',{
			confirm:function(){
				alert('confirm sending');
			}
		});
	});
});
