var runJasmineTest = function() {
	var env = jasmine.getEnv();
	env.updateInterval = 1000;

	var reporter = new jasmine.HtmlReporter();
	env.addReporter(reporter);

	env.specFilter = function(spec) {
		return reporter.specFilter(spec);
	};

	env.execute();
};
