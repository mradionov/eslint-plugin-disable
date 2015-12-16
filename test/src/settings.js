'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var test = require('tape');

var settings = require('../../src/settings');

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function plugin(settings) {
  return {
    settings: {
      'eslint-plugin-disable': settings
    }
  };
};

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

test('settings: default settings for falsy config', function (t) {
  var sets = settings.prepare(null);
  t.deepEqual(sets.paths, []);
  t.deepEqual(sets.pathsOptions, settings.defaults.pathsOptions);
  t.deepEqual(sets.extensions, settings.defaults.extensions);
  t.end();
});

test('settings: default settings for undefined settings', function (t) {
  var sets = settings.prepare({});
  t.deepEqual(sets.paths, []);
  t.deepEqual(sets.pathsOptions, settings.defaults.pathsOptions);
  t.deepEqual(sets.extensions, settings.defaults.extensions);
  t.end();
});

test('settings: default settings for undefined plugin settings', function (t) {
  var sets = settings.prepare({ settings: {} });
  t.deepEqual(sets.paths, []);
  t.deepEqual(sets.pathsOptions, settings.defaults.pathsOptions);
  t.deepEqual(sets.extensions, settings.defaults.extensions);
  t.end();
});

test('settings: default settings for empty plugin settings', function (t) {
  var sets = settings.prepare({ settings: { 'eslint-plugin-disable': {} }});
  t.deepEqual(sets.paths, []);
  t.deepEqual(sets.pathsOptions, settings.defaults.pathsOptions);
  t.deepEqual(sets.extensions, settings.defaults.extensions);
  t.end();
});

test('settings: use passed extensions', function (t) {
  var sets = settings.prepare(plugin({ extensions: ['.foo', '.bar'] }));
  t.deepEqual(sets.extensions, ['.foo', '.bar']);
  t.end();
});

test('settings: use passed path options', function (t) {
  var sets = settings.prepare(plugin({ pathsOptions: { foo: true, bar: false } }));
  t.deepEqual(sets.pathsOptions, { foo: true, bar: false });
  t.end();
});

test('settings: convert to array single string extension', function (t) {
  var sets = settings.prepare(plugin({ extensions: '.foo' }));
  t.deepEqual(sets.extensions, ['.foo']);
  t.end();
});

test('settings: modify paths to array', function (t) {
  var sets = settings.prepare(plugin({ paths: {
    'foo': ['/foo/1', '/foo/2'],
    'bar': ['/bar/1']
  }}));
  t.deepEqual(sets.paths, [
    { plugin: 'foo', paths: ['/foo/1', '/foo/2'] },
    { plugin: 'bar', paths: ['/bar/1'] }
  ]);
  t.end();
});

test('settings: convert to array single string path', function (t) {
  var sets = settings.prepare(plugin({ paths: {
    'foo': '/foo/1'
  }}));
  t.deepEqual(sets.paths, [
    { plugin: 'foo', paths: ['/foo/1'] }
  ]);
  t.end();
});
