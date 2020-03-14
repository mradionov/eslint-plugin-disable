const test = require('tape');

const FileSettings = require('../../../src/FileSettings');
const Processor = require('../../../src/Processor');

//------------------------------------------------------------------------------
// Tests - preprocess general
//------------------------------------------------------------------------------

test('Processor: "all except" inline stronger than "disable"', function(t) {
  // when using inline comment, "all except" option takes precedence
  // over regular disable rule, disable rule will be ignored

  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar', 'baz'],
    });
  };
  const text =
    '/* eslint-plugin-disable foo */' +
    '/* eslint-plugin-disable-all-except bar */' +
    'source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

//------------------------------------------------------------------------------
// Tests - postprocess
//------------------------------------------------------------------------------

test('Processor: same when no cache', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const messages = [{ ruleId: 'foo/rule1' }];

  const processor = new Processor(cache, settingsGetter);
  const messageBlocks = processor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, messages);
  t.end();
});

test('Processor: same when no plugin', function(t) {
  const cache = { '/foo/1': ['bar'] };
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const messages = [{ ruleId: 'foo/rule1' }];

  const processor = new Processor(cache, settingsGetter);
  const messageBlocks = processor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, messages);
  t.end();
});

test('Processor: remove all plugins', function(t) {
  const cache = { '/foo/1': ['foo', 'bar'] };
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const messages = [
    { ruleId: 'foo/rule1' },
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' },
  ];

  const processor = new Processor(cache, settingsGetter);
  const messageBlocks = processor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [{ ruleId: 'foo-rule1' }, { ruleId: 'qux' }]);
  t.deepEqual(cache, {});
  t.end();
});

test('Processor: remove one plugin', function(t) {
  const cache = { '/foo/1': ['foo'] };
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const messages = [
    { ruleId: 'foo/rule1' },
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' },
  ];

  const processor = new Processor(cache, settingsGetter);
  const messageBlocks = processor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' },
  ]);
  t.deepEqual(cache, {});
  t.end();
});

test('Processor: keep message without rule', function(t) {
  const cache = { '/foo/1': ['foo'] };
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo'],
    });
  };
  const messages = [{ ruleId: undefined }];

  const processor = new Processor(cache, settingsGetter);
  const messageBlocks = processor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [{ ruleId: undefined }]);
  t.deepEqual(cache, {});
  t.end();
});
