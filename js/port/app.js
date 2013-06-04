(function(){
    ImportJavscript = {
        url:function(url){
            document.write('<script type="text/javascript" src="'+url+'"></scr'+'ipt>');
        }
    };
})();

ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/lang/jquery.js');
ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/lang/class.js');
ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/lang/log.js');
ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/lang/event.js');

ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/context/executor.js');
ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/context/context.js');
ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/context/mod-context.js');
ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/context/lazy-mod.js');
ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/context/autowire.js');
ImportJavscript.url('http://style.c.aliimg.com/app/butterfly/js/context/application.js');
