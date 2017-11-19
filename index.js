'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var resolve = require('resolve');

var settings = require('./src/settings');
var processor = require('./src/processor');
var translateOptions = require('./src/translateOptions');

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var workingDirectoryPath = process.cwd();
var resolveOptions = {
  basedir: workingDirectoryPath,
};

// ESLint does not pass config object to processors.
// Locate and use ESLint engine to be able to load ESLint config for particular
// files.
// Find ESLint installation used in current working directory
var eslintPath = resolve.sync('eslint', resolveOptions);
var eslintOptionsPath = resolve.sync('eslint/lib/options', resolveOptions);

var eslint = require(eslintPath);
var eslintOptions = require(eslintOptionsPath);

var cliArgs = process.argv;

var engine = null;

// Extra guard if engine fails to load. Must catch it here, because
// otherwise ESLint will consider that plugin itself throws an error and
// fails to load.
// Options also might throw an error in case some of them are incorrect.
try {
  var options = eslintOptions.parse(cliArgs);
  engine = new eslint.CLIEngine(translateOptions(options));
} catch (err) {
  console.error('[eslint-plugin-disable]', err);
}

var processors = {};

// Register processors only if ESLint engine was successfully loaded
if (engine) {

  // Extensions are configured via ESLint CLI --ext option. Make processor
  // work with all file extensions user wants to use.
  var extensions = engine.options.extensions;

  // Store informaton about what plugins to disable for particular files
  var cache = {};

  // Process only files with specified extensions
  extensions.forEach(function (ext) {
    // Re-use the same cache for all processors, it will be modified by reference
    processors[ext] = processor.factory(cache, function settingsGetter(filePath) {
      // Load ESLint config for current file (they might be different, if user
      // has config hierarchy:
      // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
      // ESLint will throw, if config has invalid schema.
      var config = engine.getConfigForFile(filePath);

      // Consrtuct plugin settings for each file individually.
      var pluginSettings = settings.prepare(config);

      return pluginSettings;
    });
  });

}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  processors: processors
};
