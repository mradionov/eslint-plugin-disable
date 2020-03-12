'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var constants = require('./constants');

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

function PluginError(type, originalError) {
  // you can pass original error object, if re-throwing to keep it's info
  originalError = originalError || {};

  const customMessage = '[' + constants.PLUGIN_NAME + '] Error: ' + type;

  this.name = 'PluginError';
  this.type = type;
  this.message = originalError.message || customMessage;
  this.stack = originalError.stack;
}

PluginError.prototype = Object.create(Error.prototype);
PluginError.prototype.constructor = PluginError;

PluginError.TYPE_MODULE_RESOLVE = 'MODULE_RESOLVE';
PluginError.TYPE_MODULE_REQUIRE = 'MODULE_REQUIRE';

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = PluginError;
