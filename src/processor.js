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
      // Reset file options on start
      delete cache[filename];

      // ESLint requires a result to be an array of processable text blocks
      var out = [text];

      var match = text.match(DISABLE_PATTERN);
      if (match) {
        cache[filename] = true;
        // Capture group for plugins will be empty if no plugins specified,
        // in this case all plugins will be disabled. Otherwise, strip all
        // whitespaces and cache plugin names for a current file
        if (match[1]) {
          cache[filename] = match[1].replace(/\s/g, '').split(',');
        }

        // Inline rule takes precedence, no need to check file pattern
        return out;
      }

      // Resolve all paths and find plugins which have matched paths
      var plugins = [];
      settings.paths.forEach(function (opt) {
        var matches = multimatch(filename, opt.paths, { matchBase: true });
        if (matches.length) {
          plugins.push(opt.plugin);
        }
      });

      // If not plugins found - nothing to process
      if (!plugins.length) {
        return out;
      }

      // Check if all plugins are disabled, it takes precedence over single plugin
      var allIndex = plugins.indexOf(DISABLE_ALL);
      if (allIndex > -1) {
        cache[filename] = true;
      } else {
        cache[filename] = plugins.splice(allIndex, 1);
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
      var out = messages[0].filter(function (message) {
        // Plugin rules are prefixed with plugin name: "plugin/some-rule"
        var parts = message.ruleId.split('/');
        // Keep rule if it is not a part of any plugin
        if (parts.length !== 2) {
          return true;
        }
        // If all plugins are disabled or current plugin is disabled -
        // remove error/warning message for plugin from the results
        if (cache[filename] === true || cache[filename].indexOf(parts[0]) > -1) {
          return false;
        }
        return true;
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
