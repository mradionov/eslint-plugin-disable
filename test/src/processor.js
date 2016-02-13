'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var processor = require('../../src/processor');

//------------------------------------------------------------------------------
// Tests - preprocess
//------------------------------------------------------------------------------

test('preprocess: inline all plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar']
  };
  var text = '/* eslint-plugin-disable */ source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: none if no plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: []
  };
  var text = '/* eslint-plugin-disable */ source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: inline one plugin', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar']
  };
  var text = '/* eslint-plugin-disable foo */ source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: inline multiple plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar', 'baz']
  };
  var text = '/* eslint-plugin-disable foo, baz */ source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: inline keep only available plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: ['bar']
  };
  var text = '/* eslint-plugin-disable foo, bar, qux */ source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: ignore whitespaces', function (t) {
  var cache = {};
  var settings = {
    plugins: ['bar', 'baz', 'qux']
  };
  var text = '/*   eslint-plugin-disable \n bar  , baz\n, qux  */ source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['bar', 'baz', 'qux'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: settings all plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar'],
    paths: {
      '*': ['/foo/*']
    }
  };
  var text = 'source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: setting one plugin', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar'],
    paths: {
      'foo': ['/foo/*']
    }
  };
  var text = 'source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: settings multiple plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar', 'baz'],
    paths: {
      'foo': ['/foo/*'],
      'bar': ['/foo/*']
    }
  };
  var text = 'source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: setting keep only available plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo'],
    paths: {
      'foo': ['/foo/*'],
      'bar': ['/foo/*']
    }
  };
  var text = 'source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: settings all and explicit plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar'],
    paths: {
      '*': ['/foo/*'],
      'foo': ['/bar/1']
    }
  };
  var text = 'source code';
  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

//------------------------------------------------------------------------------
// Tests - postprocess
//------------------------------------------------------------------------------

test('postprocess: same when no cache', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar']
  };
  var messages = [ { ruleId: 'foo/rule1' } ];
  var pluginProcessor = processor.factory(settings, cache);
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');
  t.deepEqual(messageBlocks, messages);
  t.end();
});

test('postprocess: same when no plugin', function (t) {
  var cache = { '/foo/1': ['bar'] };
  var settings = {
    plugins: ['foo', 'bar']
  };
  var messages = [ { ruleId: 'foo/rule1' } ];
  var pluginProcessor = processor.factory(settings, cache);
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');
  t.deepEqual(messageBlocks, messages);
  t.end();
});

test('postprocess: remove all plugins', function (t) {
  var cache = { '/foo/1': ['foo', 'bar'] };
  var settings = {
    plugins: ['foo', 'bar']
  };
  var messages = [
    { ruleId: 'foo/rule1' }, { ruleId: 'bar/rule1' }, { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' }, { ruleId: 'qux' }
  ];
  var pluginProcessor = processor.factory(settings, cache);
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
  var settings = {
    plugins: ['foo', 'bar']
  };
  var messages = [
    { ruleId: 'foo/rule1' }, { ruleId: 'bar/rule1' }, { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' }, { ruleId: 'qux' }
  ];
  var pluginProcessor = processor.factory(settings, cache);
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
  var settings = {
    plugins: ['foo']
  };
  var messages = [
    { ruleId: undefined }
  ];
  var pluginProcessor = processor.factory(settings, cache);
  var messageBlocks = pluginProcessor.postprocess([messages], '/foo/1');
  t.deepEqual(messageBlocks, [
    { ruleId: undefined }
  ]);
  t.deepEqual(cache, {});
  t.end();
});
