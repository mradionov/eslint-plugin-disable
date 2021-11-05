const PluginError = require('./PluginError');
const engines = require('./Engine');

function EngineLoader(moduleLoader) {
  this.moduleLoader = moduleLoader;
}

EngineLoader.prototype.load = function() {
  let eslint;
  try {
    eslint = this.moduleLoader.load('eslint');
  } catch (err) {
    throw PluginError.create(PluginError.TYPE_ENGINE_LOAD, err);
  }

  // ESLint below 8 exports a "CLIEngine" class, 8.x has "ESLint" class
  if (eslint.CLIEngine) {
    // Extra guard if engine fails to load
    try {
      return new engines.EngineBelow8(new eslint.CLIEngine());
    } catch (err) {
      throw PluginError.create(PluginError.TYPE_ENGINE_CREATE, err);
    }
  }

  // At this point I can use 8.x "ESLint" class because it loads the congigs
  // asynchronously. To workaround it, trying to use the old CLI while it's
  // still there.
  let oldESLint;
  try {
    oldESLint = this.moduleLoader.load('eslint/lib/cli-engine');
  } catch (err) {
    throw PluginError.create(PluginError.TYPE_ENGINE_NOT_SUPPORTED, err);
  }

  if (oldESLint) {
    // Extra guard if engine fails to load
    try {
      return new engines.EngineBelow8(new oldESLint.CLIEngine());
    } catch (err) {
      throw PluginError.create(PluginError.TYPE_ENGINE_CREATE, err);
    }
  }

  // Looks like at this point the old CLIEngine is gone
  throw PluginError.create(PluginError.TYPE_ENGINE_NOT_SUPPORTED, err);
};

module.exports = EngineLoader;
