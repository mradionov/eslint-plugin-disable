'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var processor = require('../../../src/processor');

//------------------------------------------------------------------------------
// Tests - external processor
//------------------------------------------------------------------------------

test('preprocess: inline all plugins', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var externalProcessor = {
    preprocess: function(text, filePath) {
      return [text];
    },
    postprocess: function(messages, filePath) {
      return messages[0];
    }
  };
  var text = '/* eslint-plugin-disable */ source code';

  var pluginProcessor = processor.factory(
    cache, settingsGetter, externalProcessor
  );
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('postprocess: same when no cache', function (t) {
  var cache = {};
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var externalProcessor = {
    preprocess: function(text, filePath) {
      return [text];
    },
    postprocess: function(messages, filePath) {
      return messages[0];
    }
  };
  var messages = [ { ruleId: 'foo/rule1' } ];

  var pluginProcessor = processor.factory(
    cache, settingsGetter, externalProcessor
  );
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, messages);
  t.end();
});

test('postprocess: remove one plugin', function (t) {
  var cache = { '/foo/1': ['foo'] };
  var settingsGetter = function () {
    return {
      plugins: ['foo', 'bar']
    };
  };
  var externalProcessor = {
    preprocess: function(text, filePath) {
      return [text];
    },
    postprocess: function(messages, filePath) {
      return messages[0];
    }
  };
  var messages = [
    { ruleId: 'foo/rule1' }, { ruleId: 'bar/rule1' }, { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' }, { ruleId: 'qux' }
  ];

  var pluginProcessor = processor.factory(
    cache, settingsGetter, externalProcessor
  );
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' }
  ]);
  t.deepEqual(cache, {});
  t.end();
});