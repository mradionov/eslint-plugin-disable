const test = require('tape');

const ModuleLoader = require('../../src/ModuleLoader');
const Plugin = require('../../src/Plugin');

test('Plugin: has processors', function(t) {
  const moduleLoader = new ModuleLoader();
  const plugin = new Plugin(moduleLoader);

  t.ok(typeof plugin.processors === 'object' && plugin.processors !== null);
  t.end();
});
