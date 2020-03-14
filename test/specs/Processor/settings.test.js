const test = require('tape');

const FileSettings = require('../../../src/FileSettings');
const Processor = require('../../../src/Processor');

test('Processor: settings all plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
      settings: {
        'disable/plugins': '*',
      },
    });
  };
  const text = 'source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: setting one plugin', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
      settings: {
        'disable/plugins': ['foo'],
      },
    });
  };
  const text = 'source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: settings multiple plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar', 'baz'],
      settings: {
        'disable/plugins': ['foo', 'bar'],
      },
    });
  };
  const text = 'source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: setting keep only available plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo'],
      settings: {
        'disable/plugins': ['foo', 'bar'],
      },
    });
  };
  const text = 'source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: settings all and explicit plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar', 'baz'],
      settings: {
        'disable/plugins': ['foo', '*'],
      },
    });
  };
  const text = 'source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: inline is stronger then settings', function(t) {
  // paths settings are not considered when there is inline rule in file

  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
      settings: {
        'disable/plugins': ['bar'],
      },
    });
  };
  const text = '/* eslint-plugin-disable foo */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});
