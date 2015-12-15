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
var eslint = require(eslintPath);
var engine = new eslint.CLIEngine();
var config = engine.getConfigForFile();

// Prepare settings for processors
var pluginSettings = settings.prepare(config);

// Store informaton about what plugins to disable for particular files
var cache = {};

// Process only files with specified extensions
var processors = {};
pluginSettings.extensions.forEach(function (ext) {
  // Re-use the same cache for all processors, it will be modified by reference
  processors[ext] = processor.factory(pluginSettings, cache);
});

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  processors: processors
};
