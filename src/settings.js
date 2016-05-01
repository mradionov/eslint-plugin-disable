'use strict';

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var PLUGIN_NAME = 'eslint-plugin-disable';
var PLUGIN_NAME_SHORT = 'disable';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function objValuesToArray(obj) {
  var newObj = {};
  Object.keys(obj).forEach(function (key) {
    newObj[key] = toArray(obj[key]);
  });
  return newObj;
}

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

// Default settings
var defaults = {
  extensions: ['.js', '.jsx'],
  pathsOptions: {
    matchBase: true
  }
};

/**
 * Convert settings from config to use in plugin
 * @param  {Object} config ESLint constructed config object
 * @return {Object}        prettified settings object
 */
function prepare(config) {
  config = config || {};
  var settings = config.settings && config.settings[PLUGIN_NAME] || {};

  // Set paths, convert string values to array
  settings.paths = objValuesToArray(settings.paths || {});

  // Set allExceptPaths, convert string values to array
  settings.allExceptPaths = objValuesToArray(settings.allExceptPaths || {});

  // Set options for multimatch module
  settings.pathsOptions = settings.pathsOptions || defaults.pathsOptions;

  // Extensions, let user override defaults
  settings.extensions = toArray(settings.extensions || defaults.extensions);

  // Forward plugins from config or use custom ones, remove current plugin
  settings.plugins = toArray(settings.plugins || config.plugins || []);
  var index = settings.plugins.indexOf(PLUGIN_NAME_SHORT);
  if (index > -1) {
    settings.plugins.splice(index, 1);
  }

  return settings;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  prepare: prepare,
  defaults: defaults
};
