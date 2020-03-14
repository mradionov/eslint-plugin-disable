const test = require('tape');

const tryCatch = require('../helpers/tryCatch');

const ExternalProcessorLoader = require('../../src/ExternalProcessorLoader');
const PluginError = require('../../src/PluginError');

test('ExternalProcessorLoader: no string identifier', function(t) {
  const moduleLoaderStub = {
    load: function() {
      throw new PluginError(PluginError.TYPE_MODULE_RESOLVE);
    },
  };

  const externalProcessorLoader = new ExternalProcessorLoader(moduleLoaderStub);

  const fn = function() {
    externalProcessorLoader.load(123);
  };

  const err = tryCatch(fn);

  t.ok(err instanceof PluginError);
  t.equal(err.code, PluginError.TYPE_EXTERNAL_PROCESSOR_INVALID_ID);
  t.end();
});

test('ExternalProcessorLoader: plugin not found', function(t) {
  const moduleLoaderStub = {
    load: function() {
      throw new PluginError(PluginError.TYPE_MODULE_RESOLVE);
    },
  };

  const externalProcessorLoader = new ExternalProcessorLoader(moduleLoaderStub);

  const fn = function() {
    externalProcessorLoader.load('foo/foo');
  };

  const err = tryCatch(fn);

  t.ok(err instanceof PluginError);
  t.equal(err.code, PluginError.TYPE_EXTERNAL_PROCESSOR_LOAD);
  t.end();
});

test('ExternalProcessorLoader: no processors in plugin', function(t) {
  const moduleLoaderStub = {
    load: function() {
      return {};
    },
  };

  const externalProcessorLoader = new ExternalProcessorLoader(moduleLoaderStub);

  const fn = function() {
    externalProcessorLoader.load('foo/foo');
  };

  const err = tryCatch(fn);

  t.ok(err instanceof PluginError);
  t.equal(err.code, PluginError.TYPE_EXTERNAL_PROCESSOR_NOT_FOUND);
  t.end();
});

test('ExternalProcessorLoader: wrong processor name', function(t) {
  const moduleLoaderStub = {
    load: function() {
      return {
        processors: {
          bar: {
            preprocess: function() {},
            postprocess: function() {},
          },
        },
      };
    },
  };

  const externalProcessorLoader = new ExternalProcessorLoader(moduleLoaderStub);

  const fn = function() {
    externalProcessorLoader.load('foo/foo');
  };

  const err = tryCatch(fn);

  t.ok(err instanceof PluginError);
  t.equal(err.code, PluginError.TYPE_EXTERNAL_PROCESSOR_NOT_FOUND);
  t.end();
});

test('ExternalProcessorLoader: specific processor success', function(t) {
  const moduleLoaderStub = {
    load: function() {
      return {
        processors: {
          bar: {
            preprocess: function() {
              return 'bar preprocess result';
            },
            postprocess: function() {
              return 'bar postprocess result';
            },
          },
        },
      };
    },
  };

  const externalProcessorLoader = new ExternalProcessorLoader(moduleLoaderStub);

  const processor = externalProcessorLoader.load('foo/bar');

  t.equal(processor.preprocess(), 'bar preprocess result');
  t.equal(processor.postprocess(), 'bar postprocess result');
  t.end();
});

test('ExternalProcessorLoader: first processor success', function(t) {
  const moduleLoaderStub = {
    load: function() {
      return {
        processors: {
          bar: {
            preprocess: function() {
              return 'bar preprocess result';
            },
            postprocess: function() {
              return 'bar postprocess result';
            },
          },
        },
      };
    },
  };

  const externalProcessorLoader = new ExternalProcessorLoader(moduleLoaderStub);

  const processor = externalProcessorLoader.load('foo');

  t.equal(processor.preprocess(), 'bar preprocess result');
  t.equal(processor.postprocess(), 'bar postprocess result');
  t.end();
});

test('ExternalProcessorLoader: same processor not loaded twice', function(t) {
  let calls = 0;

  const moduleLoaderStub = {
    load: function() {
      calls += 1;
      return {
        processors: {
          bar: {
            preprocess: function() {
              return 'bar preprocess result';
            },
            postprocess: function() {
              return 'bar postprocess result';
            },
          },
        },
      };
    },
  };

  const externalProcessorLoader = new ExternalProcessorLoader(moduleLoaderStub);

  externalProcessorLoader.load('foo');
  externalProcessorLoader.load('foo');

  t.equal(calls, 1);
  t.end();
});
