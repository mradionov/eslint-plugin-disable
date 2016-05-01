'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var plugin = require('../index');
var settings = require('../src/settings');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

test('index: have processors', function (t) {
  t.ok(plugin.processors, 'be defined');
  t.end();
});

test('index: have processors for default extensions', function (t) {
  t.deepEqual(Object.keys(plugin.processors), settings.defaults.extensions);
  t.end();
});

test('index: have processor methods for default extensions', function (t) {
  settings.defaults.extensions.forEach(function (ext) {
    t.ok(plugin.processors[ext].preprocess, 'be defined');
    t.ok(plugin.processors[ext].postprocess, 'be defined');
  });
  t.end();
});
