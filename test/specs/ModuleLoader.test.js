const test = require('tape');
const proxyquire = require('proxyquire').noPreserveCache();

const tryCatch = require('../helpers/tryCatch');

const ModuleLoader = require('../../src/ModuleLoader');
const PluginError = require('../../src/PluginError');

test('ModuleLoader: module not found', function(t) {
  // https://www.npmjs.com/package/proxyquire#using-proxyquire-to-simulate-the-absence-of-modules
  const ProxiedModuleLoader = proxyquire('../../src/ModuleLoader', {
    eslint: null,
  });

  const moduleLoader = new ProxiedModuleLoader();

  const fn = function() {
    moduleLoader.load('eslint');
  };

  const err = tryCatch(fn);

  t.ok(err instanceof PluginError);
  t.equal(err.code, PluginError.TYPE_MODULE_LOAD);
  t.end();
});

test('ModuleLoader: loads existing module', function(t) {
  const stub = {
    foo: 42,
  };

  const ProxiedModuleLoader = proxyquire('../../src/ModuleLoader', {
    eslint: stub,
  });

  const moduleLoader = new ProxiedModuleLoader();

  const eslint = moduleLoader.load('eslint');

  t.equal(eslint, stub);
  t.end();
});

test('ModuleLoader: integration - real eslint', function(t) {
  const moduleLoader = new ModuleLoader();

  // Note: Actually tries to resolve on local machine where tests are run
  // eslint should be available if depdenencies are installed
  const eslint = moduleLoader.load('eslint');

  t.ok(typeof eslint === 'object' && eslint !== null);

  // ESLint 8.x change in API
  if (eslint.CLIEngine) {
    t.ok(eslint.CLIEngine !== undefined);
    t.ok(eslint.ESLint === undefined);
  } else {
    t.ok(eslint.CLIEngine === undefined);
    t.ok(eslint.ESLint !== undefined);
  }

  t.end();
});

test('ModuleLoader: integration - real eslint options', function(t) {
  const moduleLoader = new ModuleLoader();

  // Note: Actually tries to resolve on local machine where tests are run
  // eslint should be available if depdenencies are installed
  const eslintOptions = moduleLoader.load('eslint/lib/options');

  t.ok(typeof eslintOptions === 'object' && eslintOptions !== null);
  t.end();
});
