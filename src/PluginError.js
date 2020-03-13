const constants = require('./constants');

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
PluginError.TYPE_ENGINE_CREATE = 'ENGINE_CREATE';

module.exports = PluginError;
