describe('define', function() {
		
	var define = loader.require('define'),
		loaderEvent = loader.require('loaderEvent'),
		config = {
			id: 'test',
			modules: {}
		};

	it('define(id, depends,factory)', function() {
		define(config, 'test.A', [], 'module test.A');
		var mod = config.modules['test.A'];

		expect(mod.id).toBe('test.A');
		expect(mod.depends).toEqual([]);
		expect(mod.factory).toEqual('module test.A');
	});

	it('define(id, factory)', function() {
		var f = function() {};
		define(config, 'test.B', f);
		var mod = config.modules['test.B'];
		expect(mod.depends).toEqual([]);
		expect(mod.factory).toBe(f);
	});

	it('define(id, depends)', function() {
		define(config, 'test.C', ['a', 'b']);
		var mod = config.modules['test.C'];
		expect(mod.depends).toEqual(['a', 'b']);
	});

	it('define(id)', function() {
		define(config, 'test.D');
		var mod = config.modules['test.D'];
		expect(mod.depends.length).toBe(0);
	});

	it('define(depends, factory)', function() {
		spyOn(loaderEvent, 'trigger');
		var mod = define(config, ['a', 'b'], function() {});	
		expect(mod.depends).toEqual(['a', 'b']);
		expect(mod.anonymous).toBeTruthy();
		expect(loaderEvent.trigger).wasCalledWith('define', mod);
	});

});
