'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var resolve = require('resolve');

var prepare = require('./src/settings').prepare;
var processor = require('./src/processor').factory;

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
var defaultSettings = {
  extensions: ['.js', '.jsx']
};
var settings = prepare(config, defaultSettings);

// Store informaton about what plugins to disable for particular files
var cache = {};

// Process only files with specified extensions
var processors = {};
settings.extensions.forEach(function (ext) {
  // Re-use the same cache for all processors, it will be modified by reference
  processors[ext] = processor(settings, cache);
});

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  processors: processors
};
