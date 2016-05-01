'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var settings = require('../../src/settings');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

test('settings: default settings for falsy config', function (t) {
  var pluginSettings = settings.prepare(null);
  t.deepEqual(pluginSettings.paths, {});
  t.deepEqual(pluginSettings.allExceptPaths, {});
  t.deepEqual(pluginSettings.pathsOptions, settings.defaults.pathsOptions);
  t.deepEqual(pluginSettings.extensions, settings.defaults.extensions);
  t.deepEqual(pluginSettings.plugins, []);
  t.end();
});

test('settings: default settings for undefined settings', function (t) {
  var pluginSettings = settings.prepare({});

  t.deepEqual(pluginSettings.paths, {});
  t.deepEqual(pluginSettings.allExceptPaths, {});
  t.deepEqual(pluginSettings.pathsOptions, settings.defaults.pathsOptions);
  t.deepEqual(pluginSettings.extensions, settings.defaults.extensions);
  t.deepEqual(pluginSettings.plugins, []);
  t.end();
});

test('settings: default settings for undefined plugin settings', function (t) {
  var pluginSettings = settings.prepare({
    settings: {}
  });
  t.deepEqual(pluginSettings.paths, {});
  t.deepEqual(pluginSettings.allExceptPaths, {});
  t.deepEqual(pluginSettings.pathsOptions, settings.defaults.pathsOptions);
  t.deepEqual(pluginSettings.extensions, settings.defaults.extensions);
  t.deepEqual(pluginSettings.plugins, []);
  t.end();
});

test('settings: default settings for empty plugin settings', function (t) {
  var pluginSettings = settings.prepare({
    settings: {
      'eslint-plugin-disable': {}
    }
  });
  t.deepEqual(pluginSettings.paths, {});
  t.deepEqual(pluginSettings.allExceptPaths, {});
  t.deepEqual(pluginSettings.pathsOptions, settings.defaults.pathsOptions);
  t.deepEqual(pluginSettings.extensions, settings.defaults.extensions);
  t.deepEqual(pluginSettings.plugins, []);
  t.end();
});

test('settings: use passed extensions', function (t) {
  var pluginSettings = settings.prepare({
    settings: {
      'eslint-plugin-disable': {
        extensions: ['.foo', '.bar']
      }
    }
  });
  t.deepEqual(pluginSettings.extensions, ['.foo', '.bar']);
  t.end();
});

test('settings: use passed path options', function (t) {
  var pluginSettings = settings.prepare({
    settings: {
      'eslint-plugin-disable': {
        pathsOptions: { foo: true, bar: false }
      }
    }
  });
  t.deepEqual(pluginSettings.pathsOptions, { foo: true, bar: false });
  t.end();
});

test('settings: append plugins from config', function (t) {
  var pluginSettings = settings.prepare({
    plugins:  ['foo', 'bar']
  });
  t.deepEqual(pluginSettings.plugins, ['foo', 'bar']);
  t.end();
});

test('settings: use passed plugins', function (t) {
  var pluginSettings = settings.prepare({
    plugins: ['foo', 'bar'],
    settings: {
      'eslint-plugin-disable': {
        plugins: ['baz', 'qux']
      }
    }
  });
  t.deepEqual(pluginSettings.plugins, ['baz', 'qux']);
  t.end();
});

test('settings: remove plugin itself from config', function (t) {
  var pluginSettings = settings.prepare({
    plugins: ['foo', 'disable', 'bar']
  });
  t.deepEqual(pluginSettings.plugins, ['foo', 'bar']);
  t.end();
});

test('settings: remove plugin itself from passed', function (t) {
  var pluginSettings = settings.prepare({
    settings: {
      'eslint-plugin-disable': {
        plugins: ['foo', 'disable', 'bar']
      }
    }
  });
  t.deepEqual(pluginSettings.plugins, ['foo', 'bar']);
  t.end();
});

test('settings: convert paths to arrays', function (t) {
  var pluginSettings = settings.prepare({
    settings: {
      'eslint-plugin-disable': {
        paths: {
          '*': '*',
          'foo': '/foo/1',
          'bar': ['/bar/1']
        }
      }
    }
  });
  t.deepEqual(pluginSettings.paths, {
    '*': ['*'],
    'foo': ['/foo/1'],
    'bar': ['/bar/1']
  });
  t.end();
});

test('settingsL convert allExceptPaths to arrays', function (t) {
  var pluginSettings = settings.prepare({
    settings: {
      'eslint-plugin-disable': {
        allExceptPaths: {
          '*': '*',
          'foo': '/foo/1',
          'bar': ['/bar/1']
        }
      }
    }
  });
  t.deepEqual(pluginSettings.allExceptPaths, {
    '*': ['*'],
    'foo': ['/foo/1'],
    'bar': ['/bar/1']
  });
  t.end();
});

test('settings: convert extensions to array', function (t) {
  var pluginSettings = settings.prepare({
    settings: {
      'eslint-plugin-disable': {
        extensions: '.foo'
      }
    }
  });
  t.deepEqual(pluginSettings.extensions, ['.foo']);
  t.end();
});

test('settings: convert plugins to array', function (t) {
  var pluginSettings = settings.prepare({
    settings: {
      'eslint-plugin-disable': {
        plugins: 'foo'
      }
    }
  });
  t.deepEqual(pluginSettings.plugins, ['foo']);
  t.end();
});
