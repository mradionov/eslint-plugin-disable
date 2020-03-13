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
  const text = '/* eslint-plugin-disable */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: none if no plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: [],
    });
  };
  const text = '/* eslint-plugin-disable */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: inline one plugin', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const text = '/* eslint-plugin-disable foo */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: inline multiple plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar', 'baz'],
    });
  };
  const text = '/* eslint-plugin-disable foo, baz */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: inline keep only available plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['bar'],
    });
  };
  const text = '/* eslint-plugin-disable foo, bar, qux */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: ignore whitespaces', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['bar', 'baz', 'qux'],
    });
  };
  const text =
    '/*   eslint-plugin-disable \n bar  , baz\n, qux  */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar', 'baz', 'qux'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});
