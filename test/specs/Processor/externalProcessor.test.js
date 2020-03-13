const test = require('tape');

const FileSettings = require('../../../src/FileSettings');
const Processor = require('../../../src/Processor');

test('Processor: inline all plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const externalProcessor = {
    preprocess: function(text, filePath) {
      return [text];
    },
    postprocess: function(messages, filePath) {
      return messages[0];
    },
  };
  const text = '/* eslint-plugin-disable */ source code';

  const processor = new Processor(cache, settingsGetter, externalProcessor);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: same when no cache', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const externalProcessor = {
    preprocess: function(text, filePath) {
      return [text];
    },
    postprocess: function(messages, filePath) {
      return messages[0];
    },
  };
  const messages = [{ ruleId: 'foo/rule1' }];

  const processor = new Processor(cache, settingsGetter, externalProcessor);
  const messageBlocks = processor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, messages);
  t.end();
});

test('Processor: remove one plugin', function(t) {
  const cache = { '/foo/1': ['foo'] };
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const externalProcessor = {
    preprocess: function(text, filePath) {
      return [text];
    },
    postprocess: function(messages, filePath) {
      return messages[0];
    },
  };
  const messages = [
    { ruleId: 'foo/rule1' },
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' },
  ];

  const processor = new Processor(cache, settingsGetter, externalProcessor);
  const messageBlocks = processor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' },
  ]);
  t.deepEqual(cache, {});
  t.end();
});
