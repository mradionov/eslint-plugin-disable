'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var processor = require('../../../src/processor');

//------------------------------------------------------------------------------
// Tests - preprocess inline all except
//------------------------------------------------------------------------------

test('preprocess: all except, inline all plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var text = '/* eslint-plugin-disable-all-except */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, inline one plugin', function (t) {
  var cache = {};
  var settingsGetter = function() {
    return {
      plugins: ['foo', 'bar', 'baz']
    };
  };
  var text = '/* eslint-plugin-disable-all-except bar */';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, inline miltiple plugins', function (t) {
  var cache = {};
  var settingsGetter = function() {
    return {
      plugins: ['foo', 'bar', 'baz']
    };
  };
  var text = '/* eslint-plugin-disable-all-except foo, baz */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, ignore whitespaces', function (t) {
  var cache = {};
  var settingsGetter = function() {
    return {
      plugins: ['bar', 'baz', 'qux']
    };
  };
  var text = '/*   eslint-plugin-disable-all-except  \n bar   , baz\n, qux  ' +
             ' */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});
