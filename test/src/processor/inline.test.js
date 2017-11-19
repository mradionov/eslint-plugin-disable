'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var processor = require('../../../src/processor');

//------------------------------------------------------------------------------
// Tests - preprocess inline
//------------------------------------------------------------------------------

test('preprocess: inline all plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var text = '/* eslint-plugin-disable */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: none if no plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: []
    };
  };
  var text = '/* eslint-plugin-disable */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: inline one plugin', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var text = '/* eslint-plugin-disable foo */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: inline multiple plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar', 'baz']
    };
  };
  var text = '/* eslint-plugin-disable foo, baz */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: inline keep only available plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['bar']
    };
  };
  var text = '/* eslint-plugin-disable foo, bar, qux */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: ignore whitespaces', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['bar', 'baz', 'qux']
    };
  };
  var text = '/*   eslint-plugin-disable \n bar  , baz\n, qux  */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar', 'baz', 'qux'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});
