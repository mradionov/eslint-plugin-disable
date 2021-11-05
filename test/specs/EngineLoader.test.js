const test = require('tape');

const tryCatch = require('../helpers/tryCatch');

const EngineLoader = require('../../src/EngineLoader');
const ModuleLoader = require('../../src/ModuleLoader');
const PluginError = require('../../src/PluginError');

const FakeESLint = function() {
  this.type = 'FakeESLint';
};
const FakeCLIEngineLegacy = function() {
  this.type = 'FakeCLIEngineLegacy';
};
const FakeCLIEngineBelow8 = function() {
  this.type = 'FakeCLIEngineBelow8';
};

test('EngineLoader: eslint not found', function(t) {
  const moduleLoaderStub = {
    load: function() {
      if (path === 'eslint') {
        throw new PluginError(PluginError.TYPE_MODULE_RESOLVE);
      }
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

test('EngineLoader: use CLIEngine when version below 8', function(t) {
  const CLIEngine = function() {};
  const moduleLoaderStub = {
    load: function(path) {
      if (path === 'eslint') {
        return {
          CLIEngine: FakeCLIEngineBelow8,
        };
      }
    },
  };

  const engineLoader = new EngineLoader(moduleLoaderStub);

  const engine = engineLoader.load();

  t.equal(engine.eslintEngine.type, 'FakeCLIEngineBelow8');
  t.end();
});

test('EngineLoader: CLIEngine init fails when version below 8', function(t) {
  const moduleLoaderStub = {
    load: function(path) {
      if (path === 'eslint') {
        return {
          CLIEngine: function() {
            throw new Error('Init fail');
          },
        };
      }
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

test('EngineLoader: use legacy CLI when version 8', function(t) {
  const CLIEngine = function() {};
  const moduleLoaderStub = {
    load: function(path) {
      if (path === 'eslint') {
        return {
          ESLint: FakeESLint,
        };
      }
      if (path === 'eslint/lib/cli-engine') {
        return {
          CLIEngine: FakeCLIEngineLegacy,
        };
      }
    },
  };

  const engineLoader = new EngineLoader(moduleLoaderStub);

  const engine = engineLoader.load();

  t.equal(engine.eslintEngine.type, 'FakeCLIEngineLegacy');
  t.end();
});

test('EngineLoader: legacy CLIEngine init fails when version 8', function(t) {
  const moduleLoaderStub = {
    load: function(path) {
      if (path === 'eslint') {
        return {
          ESLint: FakeESLint,
        };
      }
      if (path === 'eslint/lib/cli-engine') {
        return {
          CLIEngine: function() {
            throw new Error('Init fail');
          },
        };
      }
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

test('EngineLoader: legacy CLIEngine not found when version 8', function(t) {
  const moduleLoaderStub = {
    load: function(path) {
      if (path === 'eslint') {
        return {
          ESLint: FakeESLint,
        };
      }
      if (path === 'eslint/lib/cli-engine') {
        throw new PluginError(PluginError.TYPE_MODULE_RESOLVE);
      }
    },
  };

  const engineLoader = new EngineLoader(moduleLoaderStub);

  const fn = function() {
    engineLoader.load();
  };

  const err = tryCatch(fn);

  t.ok(err instanceof PluginError);
  t.equal(err.code, PluginError.TYPE_ENGINE_NOT_SUPPORTED);
  t.end();
});
