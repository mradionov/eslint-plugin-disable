const test = require('tape');

const tryCatch = require('../helpers/tryCatch');

const EngineLoader = require('../../src/EngineLoader');
const ModuleLoader = require('../../src/ModuleLoader');
const PluginError = require('../../src/PluginError');

test('EngineLoader: eslint not found', function(t) {
  const moduleLoaderStub = {
    load: function() {
      throw new PluginError(PluginError.TYPE_MODULE_RESOLVE);
    },
  };

  const engineLoader = new EngineLoader(moduleLoaderStub);

  const fn = function() {
    engineLoader.load();
  };

  const err = tryCatch(fn);

  t.ok(err instanceof PluginError);
  t.equal(err.code, PluginError.TYPE_ENGINE_LOAD);
  t.end();
});

test('EngineLoader: engine init fails', function(t) {
  const moduleLoaderStub = {
    load: function() {
      const eslintStub = {
        CLIEngine: function() {
          throw new Error('Init fail');
        },
      };
      return eslintStub;
    },
  };

  const engineLoader = new EngineLoader(moduleLoaderStub);

  const fn = function() {
    engineLoader.load();
  };

  const err = tryCatch(fn);

  t.ok(err instanceof PluginError);
  t.equal(err.code, PluginError.TYPE_ENGINE_CREATE);
  t.end();
});

test('EngineLoader: engine load success', function(t) {
  const moduleLoaderStub = {
    load: function() {
      const eslintStub = {
        CLIEngine: function() {
          this.foo = 'bar';
        },
      };
      return eslintStub;
    },
  };

  const engineLoader = new EngineLoader(moduleLoaderStub);

  const engine = engineLoader.load();

  t.ok(engine.foo, 'bar');
  t.end();
});
