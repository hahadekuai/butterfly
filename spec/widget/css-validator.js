define('spec.widget.CssValidator', 
	['require', 'jQuery', 'widget.CssValidator', 'widget.Validation', 'widget.CssValidatorPropertiesFilter'], 
	function(require, $, CssValidator) {

describe(this.id, function() {
	
	it('��ֻ֤����ָ����ѡ����', function() {
		var validator = new CssValidator({
			'.a': [],
			'.b': []
		});
			
		var css = [
			{ selector: '.a', styles: [] },
			{ selector: '.b', styles: [] },
			{ selector: '.a,.b', styles: []}
		];

		expect(validator.validate(css)).toBeTruthy();

		css.push({ selector: '.c' });
		expect(validator.validate(css)).toBeFalsy();
		expect(validator.result.code).toBe('invalid_selector');
		expect(validator.result.data.ruleset).toBe(css[3]);
	});

	it('��֤����������ʽ��ѡ����', function() {
		var validator = new CssValidator({
			'/^\\.template-design-[-\\w]/': true
		});

		var css = [
			{ selector: '.template-design-a' }
		];

		expect(validator.validate(css)).toBeTruthy();

		css.push({ selector: '.template-design-'});
		expect(validator.validate(css)).toBeFalsy();
		expect(validator.result.code).toBe('invalid_selector');
	});

	it('��֤����һ����������', function() {
		var validator = new CssValidator({
			'.a': ['font-size', 'color']
		});	

		var css = [
			{ 
				selector: '.a',
				styles: [
					{ property: 'font-size', value: '12px' },
					{ property: 'color', value: '#000' }
				]
			}	
		];

		expect(validator.validate(css)).toBeTruthy();

		css[0].styles.push({ property: 'background', value: '#000' });
		expect(validator.validate(css)).toBeFalsy();
		expect(validator.result.code).toBe('invalid_property');
	});

	it('��֤����ֵ����һ���Ĺ���', function() {
		var validator = new CssValidator({
			'.hello': ['background', 'color']
		});
		validator.add('background', function(value) {
			return value === '#000000'	
		});
		validator.add('color', /^#[0-9a-f]{6}$/);

		var css = [
			{
				selector: '.hello',
				styles: [
					{ property: 'background', value: '#000000' },
					{ property: 'color', value: '#ffffff'}
				]
			}	
		];

		expect(validator.validate(css)).toBeTruthy();

		css[0].styles.push({ property: 'color', value: 'red' });
		expect(validator.validate(css)).toBeFalsy();
		expect(validator.result.code).toBe('invalid_value');
	});

	it('��֤����ֵ�ǰ���Ͱ�ϵ����', function() {
		var validator = new CssValidator({
			'.hello2': ['background']
		});
		validator.add('background', 'background-alibaba-link');

		var css = [
			{
				selector: '.hello2',
				styles: [
					{ property: 'background', value: 'url(http://www.alibaba.com/1.png)' }
				]
			}
		];

		expect(validator.validate(css)).toBeTruthy();

		css[0].styles.push({ property: 'background', value: 'url(http://www.163.com/2.png)' });
		expect(validator.validate(css)).toBeFalsy();
	});

	it('��֤ruleset����һ���Ĺ���', function() {
		var validator = new CssValidator({
			'.hello': 'all'
		});

		validator.add('all', function(ruleset) {
			var valid = true,
				all = ['background', 'font', 'color', 'z-index'];

			$.each(ruleset.styles, function(index, style) {
				if ($.inArray(style.property, all) === -1) {
					valid = false;
					return false;
				}
			});
			return valid;
		});

		var css = [
			{
				selector: '.hello',
				styles: [
					{ property: 'background' },
					{ property: 'font' },
					{ property: 'color' },	
					{ property: 'z-index' }
				]
			}
		];

		expect(validator.validate(css)).toBeTruthy();

		css[0].styles.push({ property: 'margin' });
		expect(validator.validate(css)).toBeFalsy();
	});

	it('��֤properties-filter��ʹ��', function() {
		var validator = new CssValidator({
			'.hello': 'properties-filter'
		});

		var css = [
			{
				selector: '.hello',
				styles: [
					{ property: 'background' },
					{ property: 'font' },
					{ property: 'z-index' }
				]
			}
		];

		expect(validator.validate(css)).toBeTruthy();

		css[0].styles.push({ property: '_filter' });
		expect(validator.validate(css)).toBeFalsy();
	});
	
});

});
