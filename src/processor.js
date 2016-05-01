'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var path = require('path');

var multimatch = require('multimatch');

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

// Patern to detect usage of a custom rule in a source code.
// Custom rule should have a form of a block comment.
// All whitespaces within comment block are ignored.
// Example:
//
//    /* eslint-plugin-disable angular */
//    /* eslint-plugin-disable angular, react */
//    /* eslint-plugin-disable */
//
var DISABLE_PATTERN =
  /\/\*\s*eslint-plugin-disable\s*([\S\s]*?)\*\//;

var DISABLE_ALL_EXCEPT_PATTERN =
  /\/\*\s*eslint-plugin-disable-all-except\s*([\S\s]*?)\*\//;

// Key for config settings to disable all plugins
var ALL_PLUGINS = '*';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function getInlinePlugins(text, pattern, availablePlugins) {
  var match = text.match(pattern);
  // Return null if not match to make decisions based on it
  if (!match) return null;
  // Capture group [1] for plugins will be empty if no plugins specified
  if (!match[1]) return [];

  var inlinePlugins = match[1].replace(/\s/g, '').split(',');

  var validInlinePlugins = inlinePlugins.filter(function (plugin) {
    // Remove not registered plugins
    return availablePlugins.indexOf(plugin) > -1;
  });

  return validInlinePlugins;
}

function getSettingsPlugins(
  filename, pathsToMatch, ignoreStar, availablePlugins, pathsOptions
) {
  pathsToMatch = pathsToMatch || {};

  // Save paths from the option which stands for "all plugins"
  // These paths will be combined with paths for "real" plugins,
  // so user could negate paths. Also filters out not registered plugins
  var commonPaths = pathsToMatch[ALL_PLUGINS] || [];
  delete pathsToMatch[ALL_PLUGINS];

  var matchedPlugins = availablePlugins.filter(function (plugin) {

    var pluginPathsToMatch = pathsToMatch[plugin] || [];

    // Order of concat matters, now plugin paths can negate common paths
    var paths = ignoreStar
      ? pluginPathsToMatch
      : commonPaths.concat(pluginPathsToMatch);

    var matches = multimatch(filename, paths, pathsOptions);

    // Save plugin if it matches any path
    return matches.length > 0;
  });

  return matchedPlugins;
}

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

    // Options are not combined, but executed separately in this order:
    // 1. Disable "all except" via inline comments
    // 2. Disable via inline comments
    // 3. Disable "all except" via settings
    // 4. Disable via settings
    preprocess: function (text, filename) {
      // ESLint requires a result to be an array of processable text blocks
      var out = [text];

      // Do nothing if there is no plugins registered
      if (!settings.plugins.length) return out;

      // Reset file options on start
      delete cache[filename];

      // -----------------------------------------------------------------------
      // 1. Disable "all except" via inline comments
      // -----------------------------------------------------------------------

      var allExceptInlinePlugins = getInlinePlugins(
        text, DISABLE_ALL_EXCEPT_PATTERN, settings.plugins
      );

      if (allExceptInlinePlugins) {

        if (allExceptInlinePlugins.length) {

          // Keep only plugins mentioned inline and disable the rest
          var pluginsToDisable = settings.plugins.filter(function (plugin) {
            return allExceptInlinePlugins.indexOf(plugin) === -1;
          });

          // Only set if there are plugins to disable
          if (pluginsToDisable.length) {
            cache[filename] = pluginsToDisable;
          }

        } else {
          // Do nothing if no plugins found, it means all plugins are enabled
        }

        // Return the result
        return out;

      } else {
        // Continue to next option if there is no match for this option
      }

      // -----------------------------------------------------------------------
      // 2. Disable via inline comments
      // -----------------------------------------------------------------------

      var inlinePlugins = getInlinePlugins(
        text, DISABLE_PATTERN, settings.plugins
      );

      if (inlinePlugins) {

        // Disable all plugins if no plugins specified
        var pluginsToDisable = inlinePlugins.length
          ? inlinePlugins
          : settings.plugins;

        // Only set if there are plugins to disable
        if (pluginsToDisable.length) {
          cache[filename] = pluginsToDisable;
        }

        // Return the result
        return out;

      } else {
        // Continue to next option if there is no match for this option
      }

      // -----------------------------------------------------------------------
      // 3. Disable "all except" via settings
      // -----------------------------------------------------------------------

      var settingsAllExceptPlugins = getSettingsPlugins(
        filename, settings.allExceptPaths, true,
        settings.plugins, settings.pathsOptions
      );

      if (settingsAllExceptPlugins.length) {

        // Keep only plugins matching settings paths and disable the rest
        var pluginsToDisable = settings.plugins.filter(function (plugin) {
          return settingsAllExceptPlugins.indexOf(plugin) === -1;
        });

        // Only set if there are plugins to disable
        if (pluginsToDisable.length) {
          cache[filename] = pluginsToDisable;
        }

        // Return the result
        return out;

      } else {
        // Continue to next option if there is no match for this option
      }

      // -----------------------------------------------------------------------
      // 4. Disable via settings
      // -----------------------------------------------------------------------

      var settingsPlugins = getSettingsPlugins(
        filename, settings.paths, false,
        settings.plugins, settings.pathsOptions
      );

      if (settingsPlugins.length) {

        var pluginsToDisable = settingsPlugins;

        // Only set if there are plugins to disable
        if (pluginsToDisable.length) {
          cache[filename] = pluginsToDisable;
        }

        // Return the result
        return out;

      } else {
        // No options left, proceed to the end
      }

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
      // Return "true" to keep message for rule, "false" - to remove
      var out = messages[0].filter(function (message) {
        // Rule is undefined if ESLint fails to parse source file
        if (!message.ruleId) return true;

        // Plugin rules are prefixed with plugin name: "plugin/some-rule"
        var parts = message.ruleId.split('/');
        var isRemovable = (parts.length === 2 &&
                          cache[filename].indexOf(parts[0]) > -1);

        // Return "false" to remove a message
        return !isRemovable;
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
