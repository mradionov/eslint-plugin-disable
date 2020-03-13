const constants = require('./src/constants');
const EngineLoader = require('./src/EngineLoader');
const FileSettings = require('./src/FileSettings');
const ModuleLoader = require('./src/ModuleLoader');
const Processor = require('./src/Processor');

const workingDirectoryPath = process.cwd();
const resolveOptions = {
  basedir: workingDirectoryPath,
};
const moduleLoader = new ModuleLoader(resolveOptions);
const engineLoader = new EngineLoader(moduleLoader);

const processors = {};

try {
  // ESLint does not pass config object to processors.
  // Locate and use ESLint engine to be able to load ESLint config for particular
  // files.
  const engine = engineLoader.load();

  // Store informaton about what plugins to disable for particular files
  const cache = {};

  const processor = new Processor(cache, function settingsGetter(filePath) {
    // Load ESLint config for current file (they might be different, if user
    // has config hierarchy:
    // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
    // ESLint will throw, if config has invalid schema.
    const config = engine.getConfigForFile(filePath);

    // Construct settings for each file individually.
    const settings = new FileSettings(config);

    return settings;
  });

  processors[constants.PLUGIN_PROCESSOR_NAME] = processor;
} catch (err) {
  console.error('[' + constants.PLUGIN_NAME + ']', err);
}

module.exports = {
  processors: processors,
};
