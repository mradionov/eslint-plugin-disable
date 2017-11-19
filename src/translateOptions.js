// Taken from ESLint original source code:
// https://github.com/eslint/eslint/blob/master/lib/cli.js#L42
//
// ESLint license (MIT):
// https://github.com/eslint/eslint/blob/master/LICENSE
//
// Used to translate CLI args for ESLint engine.
// Used to have the same behavior as ESLint does, when initializing the engine,
// so user-provided extensions (--ext CLI option) can be retrieved.
function translateOptions(cliOptions) {
  return {
    envs: cliOptions.env,
    extensions: cliOptions.ext,
    rules: cliOptions.rule,
    plugins: cliOptions.plugin,
    globals: cliOptions.global,
    ignore: cliOptions.ignore,
    ignorePath: cliOptions.ignorePath,
    ignorePattern: cliOptions.ignorePattern,
    configFile: cliOptions.config,
    rulePaths: cliOptions.rulesdir,
    useEslintrc: cliOptions.eslintrc,
    parser: cliOptions.parser,
    parserOptions: cliOptions.parserOptions,
    cache: cliOptions.cache,
    cacheFile: cliOptions.cacheFile,
    cacheLocation: cliOptions.cacheLocation,
    fix: (cliOptions.fix || cliOptions.fixDryRun) && (cliOptions.quiet ? quietFixPredicate : true),
    allowInlineConfig: cliOptions.inlineConfig,
    reportUnusedDisableDirectives: cliOptions.reportUnusedDisableDirectives
  };
}

module.exports = translateOptions;
