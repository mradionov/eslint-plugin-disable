'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var processor = require('../../../src/processor');

//------------------------------------------------------------------------------
// Tests - preprocess general
//------------------------------------------------------------------------------

test('preprocess: "all except" inline stronger then "disable"', function (t) {
  // when using inline comment, "all except" option takes precedence
  // over regular disable rule, disable rule will be ignored

  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar', 'baz']
    };
  };
  var text = '/* eslint-plugin-disable foo */' +
             '/* eslint-plugin-disable-all-except bar */' +
             'source code';

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: "all except" settings strong then "disable"', function (t) {
  // when using settings, "all except" option takes precedence
  // over regular disable settings, disable settings will be ignored

  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar', 'baz'],
      paths: {
        'foo': ['/foo/*']
      },
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

//------------------------------------------------------------------------------
// Tests - postprocess
//------------------------------------------------------------------------------

test('postprocess: same when no cache', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var messages = [ { ruleId: 'foo/rule1' } ];

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, messages);
  t.end();
});

test('postprocess: same when no plugin', function (t) {
  var cache = { '/foo/1': ['bar'] };
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var messages = [ { ruleId: 'foo/rule1' } ];

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, messages);
  t.end();
});

test('postprocess: remove all plugins', function (t) {
  var cache = { '/foo/1': ['foo', 'bar'] };
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var messages = [
    { ruleId: 'foo/rule1' }, { ruleId: 'bar/rule1' }, { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' }, { ruleId: 'qux' }
  ];

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' }
  ]);
  t.deepEqual(cache, {});
  t.end();
});

test('postprocess: remove one plugin', function (t) {
  var cache = { '/foo/1': ['foo'] };
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var messages = [
    { ruleId: 'foo/rule1' }, { ruleId: 'bar/rule1' }, { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' }, { ruleId: 'qux' }
  ];

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' }
  ]);
  t.deepEqual(cache, {});
  t.end();
});

test('postprocess: keep message without rule', function (t) {
  var cache = { '/foo/1': ['foo'], };
  var settingsGetter = function () {
    return {
      plugins: ['foo']
    };
  };
  var messages = [
    { ruleId: undefined }
  ];

  var pluginProcessor = processor.factory(cache, settingsGetter);
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [
    { ruleId: undefined }
  ]);
  t.deepEqual(cache, {});
  t.end();
});
