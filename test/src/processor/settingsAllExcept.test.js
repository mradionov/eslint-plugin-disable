'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var processor = require('../../../src/processor');

//------------------------------------------------------------------------------
// Tests - preprocess settings all except
//------------------------------------------------------------------------------

test('preprocess: all except, settings all plugins', function (t) {
  // all plugins (*) rule will not disable any plugins

  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['boo', 'bar'],
      allExceptPaths: {
        '*': ['/foo/*']
      }
    };
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, settings one plugin', function (t) {
  var cache = {};
  var settingsGetter = function() {
    return {
      plugins: ['foo', 'bar', 'baz'],
      allExceptPaths: {
        'bar': ['/foo/*']
      }
    };
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, setting multiple plugins', function (t) {
  // if multiple plugins target the same file, then all these plugins
  // get to be enabled for the file, other plugins get disabeld

  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar', 'baz'],
      allExceptPaths: {
        'foo': ['/foo/*'],
        'bar': ['/foo/*']
      }
    };
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, settings all and explicit plugins', function (t) {
  // particular plugin rule is stronger then * rule
  // so if all (*) plugins are enabled for some file, and then one plugin
  // is also enabled for this file, this one plugin rule takes precedence
  // and disables the rest of the plugins,
  // so as a result (*) does not make any sence

  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar', 'baz'],
      allExceptPaths: {
        '*': ['/foo/*'],
        'foo': ['/foo/1']
      }
    };
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, inline is stronger then settings', function (t) {
  // paths settings are not considered when there is inline rule in file

  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar'],
      allExceptPaths: {
        'bar': ['/foo/1']
      }
    };
  };
  var text = '/* eslint-plugin-disable-all-except foo */ source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});
