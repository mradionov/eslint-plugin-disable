const constants = require('./constants');
const EngineLoader = require('./EngineLoader');
const ExternalProcessorLoader = require('./ExternalProcessorLoader');
const FileSettings = require('./FileSettings');
const PluginError = require('./PluginError');
const Processor = require('./Processor');

function Plugin(moduleLoader) {
  const processors = {};

  const engineLoader = new EngineLoader(moduleLoader);
  const externalProcessorLoader = new ExternalProcessorLoader(moduleLoader);

  try {
    // ESLint does not pass config object to processors.
    // Locate and use ESLint engine to be able to load ESLint config
    // for particular files.
    const engine = engineLoader.load();

    // Store informaton about what plugins to disable for particular files
    const cache = {};

    const processor = new Processor(
      cache,
      function settingsGetter(filePath) {
        // Load ESLint config for current file (they might be different, if user
        // has config hierarchy:
        // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
        // ESLint will throw, if config has invalid schema.
        const config = engine.getConfigForFile(filePath);

        // Construct settings for each file individually.
        const settings = new FileSettings(config);

        return settings;
      },
      function externalProcessorGetter(settings) {
        // Check if external processor is specified. If not - it should not
        // be loaded at all.
        if (settings.externalProcessor === null) {
          return null;
        }
        const externalProcessor = externalProcessorLoader.load(
          settings.externalProcessor,
        );
        return externalProcessor;
      },
    );

    processors[constants.PLUGIN_PROCESSOR_NAME] = processor;
  } catch (err) {
    let message = err.message;

    if (err instanceof PluginError) {
      switch (err.type) {
        case PluginError.TYPE_MODULE_RESOLVE:
          message =
            'Could not resolve path to NPM module. It might not be installed.';
          break;
        case PluginError.TYPE_MODULE_LOAD:
          message =
            'Could not load NPM module. There might be an error in NPM module.';
          break;
        case PluginError.TYPE_ENGINE_LOAD:
          message = 'Could not load "eslint". Check if it is installed.';
          break;
        case PluginError.TYPE_ENGINE_CREATE:
          message = 'Could not create ESLint CLIEngine.';
          break;
        case PluginError.TYPE_EXTERNAL_PROCESSOR_INVALID_ID:
          message =
            'External processor identifier is invalid. Use "pluginName/processorName" format.';
          break;
        case PluginError.TYPE_EXTERNAL_PROCESSOR_LOAD:
          message =
            'Could not load external processor. Check if it is installed.';
          break;
        case PluginError.TYPE_EXTERNAL_PROCESSOR_NOT_FOUND:
          message =
            'Could not find an external processor with that name in a plugin. Check the name of exported processor name in plugin source.';
          break;
      }
    }

    const error = new Error();
    error.message = '[' + constants.PLUGIN_NAME + '] ' + message;
    error.stack = err.stack;
    throw error;
  }

  return { processors };
}

module.exports = Plugin;
