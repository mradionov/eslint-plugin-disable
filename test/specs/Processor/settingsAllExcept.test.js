const test = require('tape');

const FileSettings = require('../../../src/FileSettings');
const Processor = require('../../../src/Processor');

test('Processor: all except, settings all plugins', function(t) {
  // all plugins (*) rule will not disable any plugins

  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
      settings: {
        'disable/disableAllExcept': true,
        'disable/plugins': '*',
      },
    });
  };
  const text = 'source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, {});
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: all except, settings one plugin', function(t) {
  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar', 'baz'],
      settings: {
        'disable/disableAllExcept': true,
        'disable/plugins': ['bar'],
      },
    });
  };
  const text = 'source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['foo', 'baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: all except, setting multiple plugins', function(t) {
  // if multiple plugins target the same file, then all these plugins
  // get to be enabled for the file, other plugins get disabeld

  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar', 'baz'],
      settings: {
        'disable/disableAllExcept': true,
        'disable/plugins': ['bar', 'foo'],
      },
    });
  };
  const text = 'source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['baz'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});

test('Processor: all except, inline is stronger then settings', function(t) {
  // paths settings are not considered when there is inline rule in file

  const cache = {};
  const settingsGetter = function() {
    return new FileSettings({
      plugins: ['foo', 'bar'],
      settings: {
        'disable/disableAllExcept': true,
        'disable/plugins': ['bar'],
      },
    });
  };
  const text = '/* eslint-plugin-disable-all-except foo */ source code';

  const processor = new Processor(cache, settingsGetter);
  const textBlocks = processor.preprocess(text, '/foo/1');

  t.deepEqual(cache, { '/foo/1': ['bar'] });
  t.deepEqual(textBlocks, [text]);
  t.end();
});
