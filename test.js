'use strict';

var assert = require('assert');
var plugin = require('./index');

var pre = plugin.processors['.js'].preprocess;
var post = plugin.processors['.js'].postprocess;

var source =
'function greet(name) {' +
' console.log("Hi, " + name);' +
'}';

var messages = [
  { ruleId: 'angular/rule1' },
  { ruleId: 'native-rule' },
  { ruleId: 'angular/rule2' },
  { ruleId: 'angular-native-rule' },
  { ruleId: 'react/rule1' }
];

//

assert.ok(pre, 'Preprocessor has to be defined');
assert.ok(post, 'Postprocessor has to be defined');

// No option

assert.deepEqual(
  pre(source, '/some/file'),
  [source],
  'Source without option should not be changed'
);
assert.deepEqual(
  post([messages], '/some/file'),
  messages,
  'Messages without option should not be changed'
);

// For one plugin

assert.deepEqual(
  pre('/* eslint-plugin-disable angular */' + source, '/some/file'),
  ['/* eslint-plugin-disable angular */' + source],
  'Source with one option should not be changed'
);
assert.deepEqual(
  post([messages], '/some/file'),
  [
    { ruleId: 'native-rule' },
    { ruleId: 'angular-native-rule' },
    { ruleId: 'react/rule1' }
  ],
  'Messages with one option should be changed'
);

// For multiple plugins

assert.deepEqual(
  pre('/* eslint-plugin-disable angular, react */' + source, '/some/file'),
  ['/* eslint-plugin-disable angular, react */' + source],
  'Source with multiple options should not be changed'
);
assert.deepEqual(
  post([messages], '/some/file'),
  [
    { ruleId: 'native-rule' },
    { ruleId: 'angular-native-rule' }
  ],
  'Messages with multiple options should be changed'
);

// For no plugins

assert.deepEqual(
  pre('/* eslint-plugin-disable */' + source, '/some/file'),
  ['/* eslint-plugin-disable */' + source],
  'Source with no options should not be changed'
);
assert.deepEqual(
  post([messages], '/some/file'),
  [
    { ruleId: 'native-rule' },
    { ruleId: 'angular-native-rule' }
  ],
  'Messages with no options should be changed'
);
