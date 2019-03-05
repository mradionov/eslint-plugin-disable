'use strict';

var constants = require('./constants');

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
  var settings = config.settings && config.settings[constants.PLUGIN_NAME] || {};

  // Set paths, convert string values to array
  settings.paths = objValuesToArray(settings.paths || {});

  // Set allExceptPaths, convert string values to array
  settings.allExceptPaths = objValuesToArray(settings.allExceptPaths || {});

  // Set options for multimatch module
  settings.pathsOptions = settings.pathsOptions || defaults.pathsOptions;

  // Forward plugins from config or use custom ones, remove current plugin
  settings.plugins = toArray(settings.plugins || config.plugins || []);
  var index = settings.plugins.indexOf(constants.PLUGIN_NAME_SHORT);
  if (index > -1) {
    settings.plugins.splice(index, 1);
  }

  settings.cliArgs = settings.cliArgs || [];

  return settings;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  prepare: prepare,
  defaults: defaults
};
