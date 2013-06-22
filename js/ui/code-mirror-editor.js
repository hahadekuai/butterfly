/**
 * CodeMirror
 * 
 * @author yefei.niuyf
 */
define('ui.CodeMirrorEditor', ['require', 'jQuery', 'Class'], 

function(require, $, Class) {
    
var CodeMirrorEditor =  new Class({
    
    init: function(input, options) {
		var self = this;
		input = $(input);
		options = $.extend({
			mode: 'text/html',
            theme: 'eclipse',
            lineNumbers: true,
            lineWrapping: true,
            tabSize: 4
		}, options);

		var defer = $.Deferred();
		defer.promise(this);

		var urls = [
			'http://assets.1688.com??vendor/codemirror/lib/codemirror.css,vendor/codemirror/lib/codemirror.css,vendor/codemirror/theme/eclipse.css',
			'http://assets.1688.com??vendor/codemirror/lib/codemirror.js,vendor/codemirror/mode/css/css.js,vendor/codemirror/mode/javascript/javascript.js,vendor/codemirror/mode/xml/xml.js'
		];
        
		require(urls, function() {
			self.editor = CodeMirror.fromTextArea(input.get(0), options);
			setTimeout(function() {
				self.editor.refresh();
			}, 200);
			defer.resolve();
		});

		this._delegate();
	},

	_delegate: function() {
		var self = this,
			methods = ['getValue', 'setValue', 'save', 'refresh', 'focus'];
		$.each(methods, function(index, method) {
			self[method] = function() {
				return self.editor && self.editor[method].apply(self.editor, arguments);
			};
		});
	},

    insertValue: function(value) {
        var pos = this.editor.getCursor();
        this.editor.replaceRange(value, pos);
    },
    
    _getLastValue: function(){
        return this.editor && this.editor.getTextArea().value;        
    },

	isDirty: function() {
		return this._getLastValue().replace(/\r\n/g,'\n').length !== this.getValue().replace(/\r\n/g,'\n').length;	
	},

	getEditor: function() {
		return this.editor;	
	}
    
});


return CodeMirrorEditor;
//~CodeMirror

});
