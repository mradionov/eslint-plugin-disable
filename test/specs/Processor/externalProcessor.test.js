const test = require('tape');

const FileSettings = require('../../../src/FileSettings');
const Processor = require('../../../src/Processor');

test('Processor: external processor not specified', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const externalProcessorGetter = function() {
    return null;
  };
  const text = '/* eslint-plugin-disable */ source code';

  const processor = new Processor(
    cache,
    settingsGetter,
    externalProcessorGetter,
  );
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: inline all plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const externalProcessorGetter = function() {
    return {
      preprocess: function(text, filePath) {
        return [text + '(processed)'];
      },
      postprocess: function(messages, filePath) {
        return messages[0];
      },
    };
  };
  const text = '/* eslint-plugin-disable */ source code';

  const processor = new Processor(
    cache,
    settingsGetter,
    externalProcessorGetter,
  );
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text + '(processed)']);
  t.end();
});

test('Processor: same when no cache', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const externalProcessorGetter = function() {
    return {
      preprocess: function(text, filePath) {
        return [text + '(processed)'];
      },
      postprocess: function(messages, filePath) {
        return messages[0].concat({ ruleId: 'postprocess' });
      },
    };
  };
  const messages = [{ ruleId: 'foo/rule1' }];

  const processor = new Processor(
    cache,
    settingsGetter,
    externalProcessorGetter,
  );
  const messageBlocks = processor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [
    { ruleId: 'foo/rule1' },
    { ruleId: 'postprocess' },
  ]);
  t.end();
});

test('Processor: remove one plugin', function(t) {
  const cache = { '/foo/1': ['foo'] };
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const externalProcessorGetter = function() {
    return {
      preprocess: function(text, filePath) {
        return [text + '(processed)'];
      },
      postprocess: function(messages, filePath) {
        return messages[0].concat({ ruleId: 'postprocess' });
      },
    };
  };
  const messages = [
    { ruleId: 'foo/rule1' },
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo/rule2' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' },
  ];

  const processor = new Processor(
    cache,
    settingsGetter,
    externalProcessorGetter,
  );
  const messageBlocks = processor.postprocess([messages], '/foo/1');

  t.deepEqual(messageBlocks, [
    { ruleId: 'bar/rule1' },
    { ruleId: 'foo-rule1' },
    { ruleId: 'qux' },
    { ruleId: 'postprocess' },
  ]);
  t.deepEqual(cache, {});
  t.end();
});
