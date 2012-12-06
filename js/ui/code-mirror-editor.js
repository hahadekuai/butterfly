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
			'http://wpstatic.china.alibaba.com??vendor/codemirror/lib/codemirror.css,vendor/codemirror/lib/codemirror.css,vendor/codemirror/theme/eclipse.css',
			'http://wpstatic.china.alibaba.com??vendor/codemirror/lib/codemirror.js,vendor/codemirror/mode/css/css.js,vendor/codemirror/mode/javascript/javascript.js,vendor/codemirror/mode/xml/xml.js'
		];
        
		require(urls, function() {
			self.editor = CodeMirror.fromTextArea(input.get(0), options);
			defer.resolve();
		});

	},

    getValue: function() {
        return this.editor ? this.editor.getValue() : '';
    },

    insertValue: function(value) {
        var pos = this.editor.getCursor();
        this.editor.replaceRange(value, pos);
    },
    
    setValue:function(value){
        this.editor && this.editor.setValue(value);
    },
    
    refresh: function(){
        this.editor && this.editor.refresh();
    },
    
    getLastValue: function(){
        return this.editor && this.editor.getTextArea().value;        
    },

	isDirty: function() {
		return this.getLastValue() !== this.getValue();	
	},
    
    saveToTextArea: function(){
        return this.editor && this.editor.save();
    }
    
});


return CodeMirrorEditor;
//~CodeMirror

});
