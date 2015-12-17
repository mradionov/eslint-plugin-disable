'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var path = require('path');

var multimatch = require('multimatch');

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

// Patern to detect usage if a custom rule in a source code.
// Custom rule should have a form of a block comment.
// All whitespaces within comment block are ignored.
// Example:
//
//    /* eslint-plugin-disable angular */
//    /* eslint-plugin-disable angular, react */
//    /* eslint-plugin-disable */
//
var DISABLE_PATTERN = /\/\*\s*eslint-plugin-disable\s*([\S\s]*?)\*\//;

// Key for config settings to disable all plugins
var DISABLE_ALL = '*';

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

/**
 * Create a processor for ESLint
 * @param  {Object} settings constructed plugin settings
 * @param  {Object} cache    cache object, will be modified by reference
 * @return {Object}          ESLint-compatible processor
 */
function factory(settings, cache) {

  return {

    preprocess: function (text, filename) {
      // ESLint requires a result to be an array of processable text blocks
      var out = [text];

      // Do nothing if there is no plugins registered
      if (!settings.plugins.length) {
        return out;
      }

      // Reset file options on start
      delete cache[filename];

      // Capture group for plugins will be empty if no plugins specified,
      // in this case all plugins will be disabled. Otherwise, strip all
      // whitespaces and cache plugin names for a current file
      var match = text.match(DISABLE_PATTERN);
      if (match) {
        if (match[1]) {
          var inlinePlugins = match[1].replace(/\s/g, '').split(',');
          cache[filename] = inlinePlugins.filter(function (plugin) {
            // Remove non-registered plugins
            return settings.plugins.indexOf(plugin) > -1;
          });
        } else {
          // Disable all plugins
          cache[filename] = settings.plugins;
        }

        // Inline rule takes precedence, no need to check file pattern
        return out;
      }

      // Save paths from the option which stands for "all plugins"
      // These paths will be combined with paths for "real" plugins,
      // so user could negate paths. Also filter out non-registered plugins
      var commonPaths = settings.paths[DISABLE_ALL] || [];
      delete settings.paths[DISABLE_ALL];

      var plugins = settings.plugins.filter(function (plugin) {
        var paths = (settings.paths[plugin] || []).concat(commonPaths);
        var matches = multimatch(filename, paths, settings.pathsOptions);
        return matches.length;
      });

      cache[filename] = plugins;

      // ESLint requires a result to be an array of processable text blocks
      return out;
    },

    postprocess: function (messages, filename) {
      // No need to postprocess, if file was not preprocessed (has no rule)
      if (!cache[filename]) {
        // ESLint matches messages to text blocks returned from preprocess
        // by using the same array index
        return messages[0];
      }
      // Remove all disabled plugin messages
      var out = messages[0].filter(function (message) {
        // Plugin rules are prefixed with plugin name: "plugin/some-rule"
        var parts = message.ruleId.split('/');
        return !(parts.length === 2 && cache[filename].indexOf(parts[0]) > -1);
      });
      // Remove cache for file, no need to store it
      delete cache[filename];
      return out;
    }

  };

}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  factory: factory
};
