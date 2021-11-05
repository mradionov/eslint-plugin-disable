// ESLint 8.x has breaking changes to it's API
//
// https://eslint.org/docs/8.0.0/user-guide/migrating-to-8.0.0#the-cliengine-class-has-been-removed
//
// These classes wrap the differences in implementations to have a single
// interface

function EngineBelow8(eslintEngine) {
  this.eslintEngine = eslintEngine;
}

EngineBelow8.prototype.getConfigForFile = function(filePath) {
  return this.eslintEngine.getConfigForFile(filePath);
};

function Engine8(eslintEngine) {
  this.eslintEngine = eslintEngine;
}

// Returns a Promise. Can't deal with it right now, because processors are sync.
Engine8.prototype.getConfigForFile = function(filePath) {
  return this.eslintEngine.calculateConfigForFile(filePath);
};

module.exports = {
  EngineBelow8,
  Engine8,
};
