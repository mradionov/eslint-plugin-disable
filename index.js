'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var resolve = require('resolve');

var settings = require('./src/settings');
var processor = require('./src/processor');

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var workingDirectoryPath = process.cwd();
var resolveOptions = {
  basedir: workingDirectoryPath,
};

function resolveEslint(path) {
  // First try to locate a path on behalf of current working directory to find
  // a local eslint installation. If it fails to find a local installation, it
  // goes through the rest of node paths to find a package.
  // "resolve" might not be able to find global modules on Windows,
  // (https://github.com/mradionov/eslint-plugin-disable/issues/12),
  // because it originally does not look in a folder with global modules.
  // Try using Node.js "require.resolve" to find the global installation.
  try {
    return resolve.sync(path, resolveOptions);
  } catch (err) {
    // Ignore error, try using Node.js require.resolve instead.
  }
  try {
    return require.resolve(path);
  } catch (err) {
    throw err;
  }
}

// ESLint does not pass config object to processors.
// Locate and use ESLint engine to be able to load ESLint config for particular
// files.

var eslint = null;
var eslintOptions = null;

try {
  var eslintPath = resolveEslint('eslint', resolveOptions);
  var eslintOptionsPath = resolveEslint('eslint/lib/options', resolveOptions);

  eslint = require(eslintPath);
  eslintOptions = require(eslintOptionsPath);
} catch (err) {
  console.error('[eslint-plugin-disable]', err);
}

var engine = null;
var options = null;

if (eslint && eslintOptions) {

  // Extra guard if engine fails to load. Must catch it here, because
  // otherwise ESLint will consider that plugin itself throws an error and
  // fails to load.
  // Options also might throw an error in case some of them are incorrect.
  try {
    var cliArgs = process.argv;
    options = eslintOptions.parse(cliArgs);
    engine = new eslint.CLIEngine();
  } catch (err) {
    console.error('[eslint-plugin-disable]', err);
  }
}

var processors = {};

// Register processors only if ESLint engine was successfully loaded
if (engine) {

  // Extensions are configured via ESLint CLI --ext option. Make processor
  // work with all file extensions user wants to use.
  var extensions = options.ext;

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
