'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var processor = require('../../../src/processor');

//------------------------------------------------------------------------------
// Tests - preprocess settings
//------------------------------------------------------------------------------

test('preprocess: settings all plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar'],
      paths: {
        '*': ['/foo/*']
      }
    };
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: setting one plugin', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar'],
      paths: {
        'foo': ['/foo/*']
      }
    };
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: settings multiple plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar', 'baz'],
      paths: {
        'foo': ['/foo/*'],
        'bar': ['/foo/*']
      }
    };
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: setting keep only available plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo'],
      paths: {
        'foo': ['/foo/*'],
        'bar': ['/foo/*']
      }
    };
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: settings all and explicit plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar'],
      paths: {
        '*': ['/foo/*'],
        'foo': ['/bar/1']
      }
    };
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: inline is stronger then settings', function (t) {
  // paths settings are not considered when there is inline rule in file

  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar'],
      paths: {
        'bar': ['/foo/1']
      }
    };
  };
  var text = '/* eslint-plugin-disable foo */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});
