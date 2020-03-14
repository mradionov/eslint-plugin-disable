const constants = require('./constants');

function PluginError(code, originalError) {
  // you can pass original error object, if re-throwing to keep it's info
  originalError = originalError || {};

  const customMessage = '[' + constants.PLUGIN_NAME + '] Error: ' + code;

  this.name = 'PluginError';
  this.code = code;
  this.message = originalError.message || customMessage;
  this.stack = originalError.stack;
}

PluginError.prototype = Object.create(Error.prototype);
PluginError.prototype.constructor = PluginError;

PluginError.TYPE_MODULE_RESOLVE = 'MODULE_RESOLVE';
PluginError.TYPE_MODULE_LOAD = 'MODULE_LOAD';
PluginError.TYPE_ENGINE_LOAD = 'ENGINE_LOAD';
PluginError.TYPE_ENGINE_CREATE = 'ENGINE_CREATE';
PluginError.TYPE_EXTERNAL_PROCESSOR_INVALID_ID =
  'EXTERNAL_PROCESSOR_INVALID_ID';
PluginError.TYPE_EXTERNAL_PROCESSOR_LOAD = 'EXTERNAL_PROCESSOR_LOAD';
PluginError.TYPE_EXTERNAL_PROCESSOR_NOT_FOUND = 'EXTERNAL_PROCESSOR_NOT_FOUND';

module.exports = PluginError;
