const PluginError = require('./PluginError');

function EngineLoader(moduleLoader) {
  this.moduleLoader = moduleLoader;
}

EngineLoader.prototype.load = function() {
  const eslint = this.moduleLoader.load('eslint');

  // Extra guard if engine fails to load
  try {
    const engine = new eslint.CLIEngine();
    return engine;
  } catch (err) {
    throw new PluginError(PluginError.TYPE_ENGINE_CREATE, err);
  }
};

module.exports = EngineLoader;
