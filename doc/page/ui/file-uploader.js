define(['jQuery', 'ui.FileUploader'], function($, Uploader) {
	
new Uploader('#upload', {
	filter: 'image',
	url: 'upload.do',
	before: function() {
		alert('�������demo������Ҫ���ú��ʵ��ϴ��ӿڲ�������ϴ�');
		return false;	
	}
});
		
});
