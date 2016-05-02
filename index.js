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

// ESLint does not pass config object to processors
// Locate and use current user config manually
// Find ESLint installation used in current working directory
var eslintPath = resolve.sync('eslint', { basedir: process.cwd() });

// Load ESLint CLI API to fetch constructed config for current working directory
var engine = null;
var config = null;
var processors = {};

var eslint = require(eslintPath);

// Extra guard if engine fails to load. Must catch it here, because
// otherwise ESLint will consider that plugin itself throws an error and
// fails to load.
try {
  engine = new eslint.CLIEngine();
} catch (err) {
  console.log(err);
}

// It may throw errors if schema validation fails, i.e. if one of the rules
// in config file has incorrect definition. Must catch it here, because
// otherwise ESLint will consider that plugin itself throws an error and
// fails to load.
if (engine) {
  try {
    config = engine.getConfigForFile();
  } catch (err) {
    // ESLint should output this error itself
  }
}

// Register processors only if ESLint config was successfully loaded
if (config) {

  // Prepare settings for processors
  var pluginSettings = settings.prepare(config);

  // Store informaton about what plugins to disable for particular files
  var cache = {};

  // Process only files with specified extensions
  pluginSettings.extensions.forEach(function (ext) {
    // Re-use the same cache for all processors, it will be modified by reference
    processors[ext] = processor.factory(pluginSettings, cache);
  });

}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  processors: processors
};
