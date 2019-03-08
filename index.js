'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var path = require('path');

var resolve = require('resolve');

var constants = require('./src/constants');
var settings = require('./src/settings');
var processor = require('./src/processor');

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

var workingDirectoryPath = process.cwd();
var resolveOptions = {
  basedir: workingDirectoryPath,
};

function resolveEslint(path) {
  // First try to locate a path on behalf of current working directory to find
  // a local eslint installation. If it fails to find a local installation, it
  // goes through the rest of node paths to find a package.
  // "resolve" might not be able to find global modules on Windows,
  // (https://github.com/mradionov/eslint-plugin-disable/issues/12),
  // because it originally does not look in a folder with global modules.
  // Try using Node.js "require.resolve" to find the global installation.
  try {
    return resolve.sync(path, resolveOptions);
  } catch (err) {
    // Ignore error, try using Node.js require.resolve instead.
  }
  try {
    return require.resolve(path);
  } catch (err) {
    throw err;
  }
}

function logError(err) {
  console.error('[eslint-plugin-disable]', err);
}

// ESLint does not pass config object to processors.
// Locate and use ESLint engine to be able to load ESLint config for particular
// files.

var eslint = null;

try {
  var eslintPath = resolveEslint('eslint', resolveOptions);
  eslint = require(eslintPath);
} catch (err) {
  logError(err);
}


var engine = null;

if (eslint) {
  // Extra guard if engine fails to load. Must catch it here, because
  // otherwise ESLint will consider that plugin itself throws an error and
  // fails to load.
  try {
    engine = new eslint.CLIEngine();
  } catch (err) {
    logError(err);
  }
}


// Get a root config for a project to extract plugin settings, especially
// "cliArgs" which might provide custom file extension which a required to
// register processors. It won't support nested configs. Plugin settings
// must be in the root config.
var rootConfig = null;

// It may throw errors if schema validation fails, i.e. if one of the rules
// in config file has incorrect definition. Must catch it here, because
// otherwise ESLint will consider that plugin itself throws an error and
// fails to load.
if (engine) {
  try {
    rootConfig = engine.getConfigForFile();
  } catch (err) {
    // ESLint should output this error itself
  }
}


// Locate module for parsing CLI options
var eslintOptions = null;

if (rootConfig) {
  try {
    var eslintOptionsPath = resolveEslint('eslint/lib/options', resolveOptions);
    eslintOptions = require(eslintOptionsPath);
  } catch (err) {
    logError(err);
  }
}


// Extract final options which will contain extensions to register processors
var options = null;

if (eslintOptions) {
  // Options also might throw an error in case some of them are incorrect.
  try {
    var cliArgs = process.argv;

    // Check if ESLint is used via ESLint Node.js API. If it is, then ignore
    // any command line arguments, because they might not be related to ESLint
    // at all. For example, Vue cli-service wraps ESLint and runs it as a part
    // of build process, all arguments and configs are predefined and can not
    // be retrieved from here. In this case we simply ignore all the args
    // because they belong to some other binary which in turn uses ESLint
    // via it's Node.js API. Only use the args if we are actually using ESLint
    // via it's binary.
    var executedFilePath = cliArgs[1] || '';
    var isESLintBinary = executedFilePath.endsWith(path.join('.bin', 'eslint'));
    if (!isESLintBinary) {
      // All CLI args parsers will expect first arg to be a Node process, second
      // arg to be a JS file path.
      // https://nodejs.org/docs/latest/api/process.html#process_process_argv
      // Stub them as empty as we don't really care about them, but keep them
      // because we need all parsers to get following args from the right
      // indexes.
      cliArgs = ['', ''];
      // Because ESLint might be executed using it's Node.js CLI, we have no way
      // of retrieving any options it was instantiated with. Provide a
      // setting for a user to pass usual for ESLint CLI arguments to the
      // plugin, so we could retrieve a list of extensions to activate
      // the processor for.
      // Args from settings will always override CLI args.
      var rootPluginSettings = settings.prepare(rootConfig);
      if (rootPluginSettings.cliArgs.length > 0) {
        cliArgs = cliArgs.concat(rootPluginSettings.cliArgs);
      }
    }

    options = eslintOptions.parse(cliArgs);

  } catch (err) {
    logError(err);
  }
}


var processors = {};

// Register processors only if ESLint engine was successfully loaded
if (options) {

  // Extensions are configured via ESLint CLI --ext option. Make processor
  // work with all file extensions user wants to use.
  var extensions = options.ext;

  // Store informaton about what plugins to disable for particular files
  var cache = {};


  // Remove THIS plugin from the list of loaded plugins
  var rootPlugins = (rootConfig.plugins || []).filter(function (plugin) {
    return plugin !== constants.PLUGIN_NAME_SHORT;
  });

  engine.config.plugins.loadAll(rootPlugins);

  var loadedPlugins = engine.config.plugins.getAll();

  // Process only files with specified extensions
  extensions.forEach(function (ext) {

    // Currently ESLint allows to run only one processor. From the list of all
    // plugins with processors only the first processor will be executed.
    // As THIS plugin relies on processing, if it is put first in the list, then
    // a language-specific processor (like Vue) won't be executed on files and
    // will be noticed by users. If language-specific processor is put first,
    // then THIS plugin processor won't run and nothing will be "disabled".
    // To bypass this ESLint logic, THIS plugin must come first in the list
    // of plugins so it will run it's processor, and then THIS plugin will find
    // next languge-specific plugin with processor and manually run it on output
    // result. This way both plugin processors will run and user will get
    // somewhat expected result.
    var externalProcessor = null;
    for (var plugin in loadedPlugins) {
      var loadedPlugin = loadedPlugins[plugin];

      if (loadedPlugin.processors
        && Object.keys(loadedPlugin.processors).indexOf(ext) >= 0
      ) {
        externalProcessor = loadedPlugin.processors[ext];
        break;
      }
    }

    // Re-use the same cache for all processors, it will be modified by reference
    processors[ext] = processor.factory(cache, function settingsGetter(filePath) {
      // Load ESLint config for current file (they might be different, if user
      // has config hierarchy:
      // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
      // ESLint will throw, if config has invalid schema.
      var config = engine.getConfigForFile(filePath);

      // Construct plugin settings for each file individually.
      var pluginSettings = settings.prepare(config);

      return pluginSettings;
    }, externalProcessor);

  });

}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  processors: processors
};
