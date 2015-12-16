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
  t.plan(2);
  var res = settings.prepare(null);
  t.deepEqual(res.paths, []);
  t.deepEqual(res.extensions, settings.defaults.extensions);
});

test('settings: default settings for undefined settings', function (t) {
  t.plan(2);
  var res = settings.prepare({});
  t.deepEqual(res.paths, []);
  t.deepEqual(res.extensions, settings.defaults.extensions);
});

test('settings: default settings for undefined plugin settings', function (t) {
  t.plan(2);
  var res = settings.prepare({ settings: {} });
  t.deepEqual(res.paths, []);
  t.deepEqual(res.extensions, settings.defaults.extensions);
});

test('settings: default settings for empty plugin settings', function (t) {
  t.plan(2);
  var res = settings.prepare({ settings: { 'eslint-plugin-disable': {} }});
  t.deepEqual(res.paths, []);
  t.deepEqual(res.extensions, settings.defaults.extensions);
});

test('settings: use passed extensions', function (t) {
  var res = settings.prepare(plugin({ extensions: ['.foo', '.bar'] }));
  t.deepEqual(res.extensions, ['.foo', '.bar']);
  t.end();
});

test('settings: convert to array single string extension', function (t) {
  var res = settings.prepare(plugin({ extensions: '.foo' }));
  t.deepEqual(res.extensions, ['.foo']);
  t.end();
});

test('settings: modify paths to array', function (t) {
  var res = settings.prepare(plugin({ paths: {
    'foo': ['/foo/1', '/foo/2'],
    'bar': ['/bar/1']
  }}));
  t.deepEqual(res.paths, [
    { plugin: 'foo', paths: ['/foo/1', '/foo/2'] },
    { plugin: 'bar', paths: ['/bar/1'] }
  ]);
  t.end();
});

test('settings: convert to array single string path', function (t) {
  var res = settings.prepare(plugin({ paths: {
    'foo': '/foo/1'
  }}));
  t.deepEqual(res.paths, [
    { plugin: 'foo', paths: ['/foo/1'] }
  ]);
  t.end();
});
