// Patern to detect usage of a custom rule in a source code.
// Custom rule should have a form of a block comment.
// All whitespaces within comment block are ignored.
// Example:
//
//    /* eslint-plugin-disable angular */
//    /* eslint-plugin-disable angular, react */
//    /* eslint-plugin-disable */
//
const DISABLE_PATTERN = /\/\*\s*eslint-plugin-disable\s*([\S\s]*?)\*\//;

const DISABLE_ALL_EXCEPT_PATTERN = /\/\*\s*eslint-plugin-disable-all-except\s*([\S\s]*?)\*\//;

// Key for config settings to disable all plugins
const ALL_PLUGINS = '*';

// Extracts plugins from text. Filters out unregistered plugins.
function getInlinePlugins(text, pattern, registeredPlugins) {
  const match = text.match(pattern);
  // Return null if not match to make decisions based on it
  if (!match) {
    return null;
  }

  // Capture group [1] for plugins will be empty if no plugins specified
  if (!match[1]) {
    return [];
  }

  const inlinePlugins = match[1].replace(/\s/g, '').split(',');

  const validInlinePlugins = inlinePlugins.filter(function(plugin) {
    // Remove not registered plugins
    return registeredPlugins.indexOf(plugin) > -1;
  });

  return validInlinePlugins;
}

function getSettingsPlugins(registeredPlugins, settingsPlugins) {
  // Disable all registered plugins if star is present in settings
  const starIndex = settingsPlugins.indexOf(ALL_PLUGINS);
  if (starIndex > -1) {
    return registeredPlugins;
  }

  // Otherwise, simply validate settings plugins and all of then going
  // to be disabled for all paths
  const validSettingsPlugins = settingsPlugins.filter(function(plugin) {
    const isRegistered = registeredPlugins.indexOf(plugin) > -1;
    return isRegistered;
  });

  return validSettingsPlugins;
}

function getSettingsAllExceptPlugins(registeredPlugins, settingsPlugins) {
  // If star is present - disable nothing
  const starIndex = settingsPlugins.indexOf(ALL_PLUGINS);
  if (starIndex > -1) {
    return [];
  }

  // Pick plugins to disable from registered plugins except the ones in settings
  const pluginsToDisable = registeredPlugins.filter(function(plugin) {
    const isDisabled = settingsPlugins.indexOf(plugin) === -1;
    return isDisabled;
  });

  return pluginsToDisable;
}

function Processor(cache, settingsGetter, externalProcessorGetter) {
  externalProcessorGetter =
    externalProcessorGetter ||
    function() {
      return null;
    };

  // Options are not combined, but executed separately in this order:
  // 1. Disable "all except" via inline comments
  // 2. Disable via inline comments
  // 3. Disable "all except" via settings
  // 4. Disable via settings
  function preprocess(text, filePath) {
    // ESLint requires a result to be an array of processable text blocks
    let out = [text];

    // Retrieve settings for current file
    const settings = settingsGetter(filePath);

    const externalProcessor = externalProcessorGetter(settings);
    if (externalProcessor !== null) {
      out = externalProcessor.preprocess(text, filePath);
    }

    // Do nothing if there is no plugins registered
    if (settings.registeredPlugins.length === 0) {
      return out;
    }

    // Reset file options on start
    delete cache[filePath];

    // -----------------------------------------------------------------------
    // 1. Disable "all except" via inline comments
    // -----------------------------------------------------------------------

    const allExceptInlinePlugins = getInlinePlugins(
      text,
      DISABLE_ALL_EXCEPT_PATTERN,
      settings.registeredPlugins,
    );

    if (allExceptInlinePlugins !== null) {
      if (allExceptInlinePlugins.length > 0) {
        // Keep only plugins mentioned inline and disable the rest
        const pluginsToDisable = settings.registeredPlugins.filter(function(
          plugin,
        ) {
          return allExceptInlinePlugins.indexOf(plugin) === -1;
        });

        // Only set if there are plugins to disable
        if (pluginsToDisable.length > 0) {
          cache[filePath] = pluginsToDisable;
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

    const inlinePlugins = getInlinePlugins(
      text,
      DISABLE_PATTERN,
      settings.registeredPlugins,
    );

    if (inlinePlugins !== null) {
      // Disable all plugins if no plugins specified
      const pluginsToDisable = inlinePlugins.length
        ? inlinePlugins
        : settings.registeredPlugins;

      // Only set if there are plugins to disable
      if (pluginsToDisable.length > 0) {
        cache[filePath] = pluginsToDisable;
      }

      // Return the result
      return out;
    } else {
      // Continue to next option if there is no match for this option
    }

    // -----------------------------------------------------------------------
    // 3. Disable "all except" via settings
    // -----------------------------------------------------------------------
    if (settings.disableAllExcept === true) {
      const pluginsToDisable = getSettingsAllExceptPlugins(
        settings.registeredPlugins,
        settings.settingsPlugins,
      );

      // Only set if there are plugins to disable
      if (pluginsToDisable.length > 0) {
        cache[filePath] = pluginsToDisable;
      }

      return out;
    }

    // -----------------------------------------------------------------------
    // 4. Disable via settings
    // -----------------------------------------------------------------------

    const pluginsToDisable = getSettingsPlugins(
      settings.registeredPlugins,
      settings.settingsPlugins,
    );

    // Only set if there are plugins to disable
    if (pluginsToDisable.length > 0) {
      cache[filePath] = pluginsToDisable;
    }

    // Return the result
    return out;
  }

  function postprocess(messages, filePath) {
    const settings = settingsGetter(filePath);
    const externalProcessor = externalProcessorGetter(settings);

    // No need to postprocess, if file was not preprocessed (has no rule)
    if (cache[filePath] === undefined) {
      if (externalProcessor === null) {
        // ESLint matches messages to text blocks returned from preprocess
        // by using the same array index
        return messages[0];
      }

      return externalProcessor.postprocess(messages, filePath);
    }

    // Remove all disabled plugin messages
    // Return "true" to keep message for rule, "false" - to remove
    const out = messages[0].filter(function(message) {
      // Rule is undefined if ESLint fails to parse source file
      if (!message.ruleId) {
        return true;
      }

      // Plugin rules are prefixed with plugin name: "plugin/some-rule"
      const parts = message.ruleId.split('/');
      const isRemovable =
        parts.length === 2 && cache[filePath].indexOf(parts[0]) > -1;

      // Return "false" to remove a message
      return !isRemovable;
    });

    // Remove cache for file, no need to store it
    delete cache[filePath];

    if (externalProcessor === null) {
      return out;
    }

    return externalProcessor.postprocess([out]);
  }

  return {
    // When ESLint is used with --fix flag, make sure that plugin does not
    // block autofixing.
    // Fixable plugin rules, which are disabled, won't be fixed.
    supportsAutofix: true,

    preprocess,
    postprocess,
  };
}

module.exports = Processor;
