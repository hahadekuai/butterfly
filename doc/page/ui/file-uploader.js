define(['jQuery', 'ui.FileUploader'], function($, Uploader) {
	
new Uploader('#upload', {
	filter: 'image',
	url: 'upload.do',
	before: function() {
		alert('这仅仅是demo，你需要配置合适的上传接口才能完成上传');
		return false;	
	}
});
		
});
