const ModuleLoader = require('./src/ModuleLoader');
const Plugin = require('./src/Plugin');

const workingDirectoryPath = process.cwd();
const resolveOptions = {
  basedir: workingDirectoryPath,
};
const moduleLoader = new ModuleLoader(resolveOptions);

const plugin = new Plugin(moduleLoader);

module.exports = plugin;
