define('spec.context.ModContext', 

['jQuery', 'context.ModContext'],
function($, ModContext) {

describe(this.id, function() {
	
	it('��ʹ��ModContext', function() {
		var modContext = new ModContext('test.ModContext', {
			moduleFilter: /^test\.mod\./,
			loader: butterfly,
		});

		var testNode = $('<div data-mod-id="test.mod.MyMod">'),
			testConfig = {
				url: 'http://www.1688.com'
			};

		testNode.data('modConfig', testConfig);

		$('body').append(testNode);

		var flag = false;
		define('test.mod.MyMod', function() {
			return function(node, config) {
				flag = true;
				expect(node[0]).toBe(testNode[0]);
				expect(config).toBe(testConfig);
				expect(config.url2).toBe('hello');
			};
		});

		// �¼�֧��
		modContext.on('mod-before-init', function(o) {
			o.config.url2 = 'hello';
		});

		modContext.start();
		expect(flag).toBeTruthy();

	});

	
});
		
});
