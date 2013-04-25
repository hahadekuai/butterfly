define(['loader'], function(loader) {

var alias = loader.require('alias');

alias.push({
	'Context': 'context.Context',
	'Executor': 'context.Executor'
});
		
});
