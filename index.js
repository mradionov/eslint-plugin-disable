'use strict';

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

// Preprocess only files with these extensions
var extensions = ['.js', '.jsx'];

// Store informaton about what plugins to disable for particular files
var cache = {};

var processor = {

  preprocess: function (text, filename) {
    var match = text.match(DISABLE_PATTERN);
    if (match) {
      cache[filename] = true;
      // Capture group for plugins will be empty if no plugins specified,
      // in this case all plugins will be disabled. Otherwise, strip all
      // whitespaces and cache plugin names for a current file
      if (match[1]) {
        cache[filename] = match[1].replace(/\s/g, '').split(',');
      }
    }
    // ESLint requires a result to be an array of processable text blocks
    return [text];
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

// Have the same logic for all types of files
var processors = extensions.reduce(function (procs, ext) {
  procs[ext] = processor;
  return procs;
}, {});

module.exports = {
  processors: processors
};
