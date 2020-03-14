const PluginError = require('./PluginError');

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

  // Extra guard if engine fails to load
  try {
    const engine = new eslint.CLIEngine();
    return engine;
  } catch (err) {
    throw PluginError.create(PluginError.TYPE_ENGINE_CREATE, err);
  }
};

module.exports = EngineLoader;
