const constants = require('./constants');
const PluginError = require('./PluginError');

function ExternalProcessorLoader(moduleLoader) {
  this.moduleLoader = moduleLoader;

  this.loaded = {};
}

ExternalProcessorLoader.prototype.load = function(identifier) {
  if (typeof identifier !== 'string') {
    throw PluginError.create(PluginError.TYPE_EXTERNAL_PROCESSOR_INVALID_ID);
  }

  if (this.loaded[identifier] !== undefined) {
    return this.loaded[identifier];
  }

  // Follow processor naming convention ("pluginName/processorName")
  // https://github.com/eslint/rfcs/tree/master/designs/2018-processors-improvements#add-a-processor-configuration-option
  const parts = identifier.split('/');

  const pluginName = parts[0];
  let processorName = parts[1];

  // Manually require eslint plugin

  const pluginModuleName = constants.ESLINT_PLUGIN_PREFIX + pluginName;

  let pluginModule;
  try {
    pluginModule = this.moduleLoader.load(pluginModuleName) || {};
  } catch (err) {
    throw PluginError.create(PluginError.TYPE_EXTERNAL_PROCESSOR_LOAD, err);
  }

  const pluginProcessors = pluginModule.processors || {};
  const pluginProcessorNames = Object.keys(pluginProcessors);

  // No processors at all
  if (pluginProcessorNames.length === 0) {
    throw PluginError.create(PluginError.TYPE_EXTERNAL_PROCESSOR_NOT_FOUND);
  }

  // If user set specific processor name ("pluginName/processorName")
  // - fail if not found
  if (
    processorName !== undefined &&
    pluginProcessors[processorName] === undefined
  ) {
    throw PluginError.create(PluginError.TYPE_EXTERNAL_PROCESSOR_NOT_FOUND);
  }

  if (processorName === undefined) {
    // If user did not specify processor name ("pluginName")
    // - use the first available
    processorName = pluginProcessorNames[0];
  }

  const processor = pluginProcessors[processorName];

  this.loaded[identifier] = processor;

  return processor;
};

module.exports = ExternalProcessorLoader;
