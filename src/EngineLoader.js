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

  // Extra guard if engine fails to load
  try {
    if (eslint.CLIEngine) {
      return new engines.EngineBelow8(eslint);
    }
    return new engines.Engine8(eslint);
  } catch (err) {
    throw PluginError.create(PluginError.TYPE_ENGINE_CREATE, err);
  }
};

module.exports = EngineLoader;
