const test = require('tape');

const plugin = require('../../index');

test('index: have processors', function(t) {
  t.ok(plugin.processors, 'be defined');
  t.end();
});
