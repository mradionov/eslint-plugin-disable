'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// const test = require('tape');

// const Loader = require('../../src/Loader');
// const PluginError = require('../../src/PluginError');

// //------------------------------------------------------------------------------
// // Tests
// //------------------------------------------------------------------------------

// test('Loader: cant load eslint', function (t) {
//   const resolverMock = {
//     resolve: function() {
//       throw new PluginError(PluginError.TYPE_ESLINT_MODULE_RESOLVE);
//     }
//   };

//   const loader = new Loader(resolverMock);

//   const fn = function() {
//     loader.load();
//   };

//   t.throws(fn, new PluginError(PluginError.TYPE_ESLINT_MODULE_RESOLVE));
//   t.end();
// });