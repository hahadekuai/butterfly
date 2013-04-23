describe('log', function() {

var Log = loader.require('log');


it('global log', function() {
	var log = Log,
		last = log.level;
	
	log.level = log.LEVEL.error;

	test(log);

	log.info('a', 'b', 'c', 'd');
	log('a')('b')('c')('d');

	log.level = last;
});

it('instance log', function() {
	var log = new Log('test');
	test(log, 'test');
});

var test = function(log, type) {
	spyOn(Log, 'handler');
	
	log.level = log.LEVEL.error;

	expect(log.isEnabled('error')).toBeTruthy();
	log.error('some error to log');
	expect(Log.handler).wasCalledWith('some error to log', 'error', type);

	Log.handler.reset();

	expect(log.isEnabled('info')).toBeFalsy();
	log.info('some log info to log');
	expect(Log.handler).wasNotCalled();

	Log.handler.reset();

	log.level = log.LEVEL.info;
	expect(log.isEnabled('error')).toBeTruthy();

	log.error('some error to log');
	expect(Log.handler).wasCalledWith('some error to log', 'error', type);

	Log.handler.reset();

	expect(log.isEnabled('info')).toBeTruthy();
	log.info('some info to log');
	expect(Log.handler).wasCalledWith('some info to log', 'info', type);
};


});
