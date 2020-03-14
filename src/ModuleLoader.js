const resolve = require('resolve');

const PluginError = require('./PluginError');

function ModuleLoader(options) {
  // Options are passed directly to "resolve" module
  this.options = options;
}

ModuleLoader.prototype.load = function(path) {
  const resolvedPath = this.resolve(path);
  try {
    const loadedModule = require(resolvedPath);
    return loadedModule;
  } catch (err) {
    throw PluginError.create(PluginError.TYPE_MODULE_LOAD, err);
  }
};

ModuleLoader.prototype.resolve = function(path) {
  // First try to locate a path on behalf of current working directory to find
  // a local eslint installation. If it fails to find a local installation, it
  // goes through the rest of node paths to find a package.
  // "resolve" might not be able to find global modules on Windows,
  // (https://github.com/mradionov/eslint-plugin-disable/issues/12),
  // because it originally does not look in a folder with global modules.
  // Try using Node.js "require.resolve" to find the global installation.
  try {
    return resolve.sync(path, this.options);
  } catch (err) {
    // Ignore error, try using Node.js require.resolve instead.
  }
  try {
    return require.resolve(path);
  } catch (err) {
    throw PluginError.create(PluginError.TYPE_MODULE_RESOLVE, err);
  }
};

module.exports = ModuleLoader;
