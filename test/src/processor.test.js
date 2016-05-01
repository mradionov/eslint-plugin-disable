'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var processor = require('../../src/processor');

//------------------------------------------------------------------------------
// Tests - preprocess inline
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

//------------------------------------------------------------------------------
// Tests - preprocess inline all except
//------------------------------------------------------------------------------

test('preprocess: all except, inline all plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar']
  };
  var text = '/* eslint-plugin-disable-all-except */ source code';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, inline one plugin', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar', 'baz']
  };
  var text = '/* eslint-plugin-disable-all-except bar */';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, inline miltiple plugins', function (t) {
  var cache = {};
  var settings = {
    plugins: ['foo', 'bar', 'baz']
  };
  var text = '/* eslint-plugin-disable-all-except foo, baz */ source code';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, ignore whitespaces', function (t) {
  var cache = {};
  var settings = {
    plugins: ['bar', 'baz', 'qux']
  };
  var text = '/*   eslint-plugin-disable-all-except  \n bar   , baz\n, qux  ' +
             ' */ source code';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  console.log(cache);

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

//------------------------------------------------------------------------------
// Tests - preprocess settings
//------------------------------------------------------------------------------

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

test('preprocess: inline is stronger then settings', function (t) {
  // paths settings are not considered when there is inline rule in file

  var cache = {};
  var settings = {
    plugins: ['foo', 'bar'],
    paths: {
      'bar': ['/foo/1']
    }
  };
  var text = '/* eslint-plugin-disable foo */ source code';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

//------------------------------------------------------------------------------
// Tests - preprocess settings all except
//------------------------------------------------------------------------------

test('preprocess: all except, settings all plugins', function (t) {
  // all plugins (*) rule will not disable any plugins

  var cache = {};
  var settings = {
    plugins: ['boo', 'bar'],
    allExceptPaths: {
      '*': ['/foo/*']
    }
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, settings one plugin', function (t) {
  var cache = {};
  var settings= {
    plugins: ['foo', 'bar', 'baz'],
    allExceptPaths: {
      'bar': ['/foo/*']
    }
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, setting multiple plugins', function (t) {
  // if multiple plugins target the same file, then all these plugins
  // get to be enabled for the file, other plugins get disabeld

  var cache = {};
  var settings = {
    plugins: ['foo', 'bar', 'baz'],
    allExceptPaths: {
      'foo': ['/foo/*'],
      'bar': ['/foo/*']
    }
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(settings, cache);
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
  var settings = {
    plugins: ['foo', 'bar', 'baz'],
    allExceptPaths: {
      '*': ['/foo/*'],
      'foo': ['/foo/1']
    }
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: all except, inline is stronger then settings', function (t) {
  // paths settings are not considered when there is inline rule in file

  var cache = {};
  var settings = {
    plugins: ['foo', 'bar'],
    allExceptPaths: {
      'bar': ['/foo/1']
    }
  };
  var text = '/* eslint-plugin-disable-all-except foo */ source code';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

//------------------------------------------------------------------------------
// Tests - preprocess general
//------------------------------------------------------------------------------

test('preprocess: "all except" inline stronger then "disable"', function (t) {
  // when using inline comment, "all except" option takes precedence
  // over regular disable rule, disable rule will be ignored

  var cache = {};
  var settings = {
    plugins: ['foo', 'bar', 'baz']
  };
  var text = '/* eslint-plugin-disable foo */' +
             '/* eslint-plugin-disable-all-except bar */' +
             'source code';

  var pluginProcessor = processor.factory(settings, cache);
  var textBlocks = pluginProcessor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('preprocess: "all except" settings strong then "disable"', function (t) {
  // when using settings, "all except" option takes precedence
  // over regular disable settings, disable settings will be ignored

  var cache = {};
  var settings = {
    plugins: ['foo', 'bar', 'baz'],
    paths: {
      'foo': ['/foo/*']
    },
    allExceptPaths: {
      'bar': ['/foo/*']
    }
  };
  var text = 'source code';

  var pluginProcessor = processor.factory(settings, cache);
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
