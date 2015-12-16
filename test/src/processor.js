'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var processor = require('../../src/processor');

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function settings(paths) {
  paths = paths || {};
  return {
    paths: Object.keys(paths).map(function (plugin) {
      return {
        plugin: plugin,
        paths: paths[plugin]
      };
    })
  };
}

//------------------------------------------------------------------------------
// Tests - preprocess
//------------------------------------------------------------------------------

test('preprocess: clear cache', function (t) {
  var cache = { '/foo/1': ['bar'] };
  var text = 'source code';
  var p = processor.factory(settings(), cache);
  var pre = p.preprocess(text, '/foo/1');
  t.notOk(cache['/foo/1']);
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: inline all plugins', function (t) {
  var cache = {};
  var text = '/* eslint-plugin-disable */ source code';
  var p = processor.factory(settings(), cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': true });
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: inline one plugin', function (t) {
  var cache = {};
  var text = '/* eslint-plugin-disable bar */ source code';
  var p = processor.factory(settings(), cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: inline multiple plugins', function (t) {
  var cache = {};
  var text = '/* eslint-plugin-disable bar, baz, qux */ source code';
  var p = processor.factory(settings(), cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['bar', 'baz', 'qux'] });
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: ignore whitespaces', function (t) {
  var cache = {};
  var text = '/*   eslint-plugin-disable \n bar  , baz\n, qux  */ source code';
  var p = processor.factory(settings(), cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['bar', 'baz', 'qux'] });
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: settings all plugins', function (t) {
  var cache = {};
  var text = 'source code';
  var sets = settings({ '*': ['/foo/*'] });
  var p = processor.factory(sets, cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': true });
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: settings one plugin', function (t) {
  var cache = {};
  var text = 'source code';
  var sets = settings({ 'bar': ['/foo/*'] });
  var p = processor.factory(sets, cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: settings multiple plugins one file', function (t) {
  var cache = {};
  var text = 'source code';
  var sets = settings({ 'bar': ['/foo/*'], 'baz': ['/foo/*'] });
  var p = processor.factory(sets, cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['bar', 'baz'] });
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: settings multiple plugins multiple files', function (t) {
  var cache = {};
  var text = 'source code';
  var sets = settings({ 'bar': ['/foo/*'], 'baz': ['/moo/*'] });
  var p = processor.factory(sets, cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: settings no matching path', function (t) {
  var cache = {};
  var text = 'source code';
  var sets = settings({ 'bar': ['/boo/*'] });
  var p = processor.factory(sets, cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, {});
  t.deepEqual(pre, [text]);
  t.end();
});

test('preprocess: settings star overides one plugin', function (t) {
  var cache = {};
  var text = 'source code';
  var sets = settings({ 'bar': ['/foo/*'], '*': ['*'] });
  var p = processor.factory(sets, cache);
  var pre = p.preprocess(text, '/foo/1');
  t.deepEqual(cache, { '/foo/1': true });
  t.deepEqual(pre, [text]);
  t.end();
});

//------------------------------------------------------------------------------
// Tests - postprocess
//------------------------------------------------------------------------------

test('postprocess: same when no cache', function (t) {
  var cache = {};
  var messages = [ { ruleId: 'foo/rule1' } ];
  var p = processor.factory(settings(), cache);
  var post = p.postprocess([messages], '/foo/1');
  t.deepEqual(post, messages);
  t.end();
});

test('postprocess: same when no plugin', function (t) {
  var cache = { '/foo/1': ['another'] };
  var messages = [ { ruleId: 'foo/rule1' } ];
  var p = processor.factory(settings(), cache);
  var post = p.postprocess([messages], '/foo/1');
  t.deepEqual(post, messages);
  t.end();
});

test('postprocess: remove all plugins', function (t) {
  var cache = { '/foo/1': true };
  var messages = [
    { ruleId: 'foo/rule1' }, { ruleId: 'bar/rule1' }, { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' }, { ruleId: 'qux' }
  ];
  var p = processor.factory(settings(), cache);
  var post = p.postprocess([messages], '/foo/1');
  t.deepEqual(post, [
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' }
  ]);
  t.deepEqual(cache, {});
  t.end();
});

test('postprocess: remove one plugin', function (t) {
  var cache = { '/foo/1': ['foo'] };
  var messages = [
    { ruleId: 'foo/rule1' }, { ruleId: 'bar/rule1' }, { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' }, { ruleId: 'qux' }
  ];
  var p = processor.factory(settings(), cache);
  var post = p.postprocess([messages], '/foo/1');
  t.deepEqual(post, [
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' }
  ]);
  t.deepEqual(cache, {});
  t.end();
});

test('postprocess: remove multiple plugins', function (t) {
  var cache = { '/foo/1': ['foo', 'bar'] };
  var messages = [
    { ruleId: 'foo/rule1' }, { ruleId: 'bar/rule1' }, { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' }, { ruleId: 'qux' }
  ];
  var p = processor.factory(settings(), cache);
  var post = p.postprocess([messages], '/foo/1');
  t.deepEqual(post, [
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' }
  ]);
  t.deepEqual(cache, {});
  t.end();
});
