const test = require('tape');

const FileSettings = require('../../../src/FileSettings');
const Processor = require('../../../src/Processor');

test('Processor: all except, inline all plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
    });
  };
  const text = '/* eslint-plugin-disable-all-except */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: all except, inline one plugin', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar', 'baz'],
    });
  };
  const text = '/* eslint-plugin-disable-all-except bar */';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: all except, inline miltiple plugins', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar', 'baz'],
    });
  };
  const text = '/* eslint-plugin-disable-all-except foo, baz */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: all except, ignore whitespaces', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['bar', 'baz', 'qux'],
    });
  };
  const text =
    '/*   eslint-plugin-disable-all-except  \n bar   , baz\n, qux  ' +
    ' */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});
