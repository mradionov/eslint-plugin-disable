'use strict';

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var PLUGIN_NAME = 'eslint-plugin-disable';

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

/**
 * Convert settings from config to use in plugin
 * @param  {Object} config ESLint constructed config object
 * @return {Object}        prettified settings object
 */
function prepare(config, defaults) {
  var settings = config.settings && config.settings[PLUGIN_NAME] || {};

  // Extensions, let user override defaults, let user pass a string (single ext)
  settings.extensions = settings.extensions || defaults.extensions;
  if (!Array.isArray(settings.extensions)) {
    settings.extensions = [settings.extensions];
  }

  // Paths, simplify settings structure for paths, let user pass a string
  settings.paths = Object.keys(settings.paths || {}).map(function (plugin) {
    var paths = settings.paths[plugin];
    if (!Array.isArray(paths)) {
      paths = [paths];
    }
    return {
      plugin: plugin,
      paths: paths
    };
  });

  return settings;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  prepare: prepare
};
