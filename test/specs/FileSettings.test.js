const test = require('tape');

const FileSettings = require('../../src/FileSettings');

test('FileSettings: no args', function(t) {
  const settings = new FileSettings();

  t.deepEqual(settings, {
    registeredPlugins: [],
    settingsPlugins: [],
    disableAllExcept: false,
  });
  t.end();
});

test('FileSettings: config with empty settings', function(t) {
  const config = {};
  const settings = new FileSettings(config);

  t.deepEqual(settings, {
    registeredPlugins: [],
    settingsPlugins: [],
    disableAllExcept: false,
  });
  t.end();
});

test('FileSettings: config with plugins', function(t) {
  const config = { plugins: ['foo', 'disable', 'bar'] };
  const settings = new FileSettings(config);

  t.deepEqual(settings, {
    registeredPlugins: ['foo', 'bar'],
    settingsPlugins: [],
    disableAllExcept: false,
  });
  t.end();
});

test('FileSettings: settings plugins dont overlap with registered plugins', function(t) {
  const config = {
    plugins: ['foo', 'disable', 'bar'],
    settings: {
      'eslint-plugin-disable': {
        plugins: ['baz', 'qux', 'disable'],
      },
    },
  };
  const settings = new FileSettings(config);

  t.deepEqual(settings, {
    registeredPlugins: ['foo', 'bar'],
    settingsPlugins: ['baz', 'qux'],
    disableAllExcept: false,
  });
  t.end();
});

test('FileSettings: settings plugins star stays', function(t) {
  const config = {
    plugins: ['foo', 'disable', 'bar'],
    settings: {
      'eslint-plugin-disable': {
        plugins: ['*'],
      },
    },
  };
  const settings = new FileSettings(config);

  t.deepEqual(settings, {
    registeredPlugins: ['foo', 'bar'],
    settingsPlugins: ['*'],
    disableAllExcept: false,
  });
  t.end();
});

test('FileSettings: settings plugins string', function(t) {
  const config = {
    plugins: ['foo', 'disable', 'bar'],
    settings: {
      'eslint-plugin-disable': {
        plugins: 'foo',
      },
    },
  };
  const settings = new FileSettings(config);

  t.deepEqual(settings, {
    registeredPlugins: ['foo', 'bar'],
    settingsPlugins: ['foo'],
    disableAllExcept: false,
  });
  t.end();
});
