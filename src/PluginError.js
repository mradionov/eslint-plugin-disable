const constants = require('./constants');

function PluginError(code, originalError, message) {
  message = message || '';

  const fullMessage =
    '[' + constants.PLUGIN_NAME + '] ' + code + ': ' + message;

  // you can pass original error object, if re-throwing to keep it's info
  originalError = originalError || new Error(fullMessage);

  this.code = code;
  this.message = fullMessage;
  this.stack = originalError.stack;
}

PluginError.prototype = Object.create(Error.prototype);
PluginError.prototype.constructor = PluginError;
PluginError.prototype.name = 'PluginError';

PluginError.TYPE_MODULE_RESOLVE = 'MODULE_RESOLVE';
PluginError.TYPE_MODULE_LOAD = 'MODULE_LOAD';
PluginError.TYPE_ENGINE_LOAD = 'ENGINE_LOAD';
PluginError.TYPE_ENGINE_CREATE = 'ENGINE_CREATE';
PluginError.TYPE_ENGINE_NOT_SUPPORTED = 'ENGINE_NOT_SUPPORTED';
PluginError.TYPE_EXTERNAL_PROCESSOR_INVALID_ID =
  'EXTERNAL_PROCESSOR_INVALID_ID';
PluginError.TYPE_EXTERNAL_PROCESSOR_LOAD = 'EXTERNAL_PROCESSOR_LOAD';
PluginError.TYPE_EXTERNAL_PROCESSOR_NOT_FOUND = 'EXTERNAL_PROCESSOR_NOT_FOUND';

PluginError.create = function(code, originalError) {
  let message = '';

  switch (code) {
    case PluginError.TYPE_MODULE_RESOLVE:
      message =
        'Could not resolve path to NPM module. It might not be installed.';
      break;
    case PluginError.TYPE_MODULE_LOAD:
      message =
        'Could not load NPM module. There might be an error in NPM module.';
      break;
    case PluginError.TYPE_ENGINE_LOAD:
      message = 'Could not load "eslint". Check if it is installed.';
      break;
    case PluginError.TYPE_ENGINE_CREATE:
      message = 'Could not create ESLint CLIEngine.';
      break;
    case PluginError.TYPE_ENGINE_NOT_SUPPORTED:
      message =
        'ESLint engine not supported. Please create an issue on GitHub if you see this: https://github.com/mradionov/eslint-plugin-disable';
      break;
    case PluginError.TYPE_EXTERNAL_PROCESSOR_INVALID_ID:
      message =
        'External processor identifier is invalid. Use "pluginName/processorName" format.';
      break;
    case PluginError.TYPE_EXTERNAL_PROCESSOR_LOAD:
      message = 'Could not load external processor. Check if it is installed.';
      break;
    case PluginError.TYPE_EXTERNAL_PROCESSOR_NOT_FOUND:
      message =
        'Could not find external processor with that name. Check the name of exported processor in external plugin source.';
      break;
  }

  const error = new PluginError(code, originalError, message);

  return error;
};

module.exports = PluginError;
