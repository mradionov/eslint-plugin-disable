## Migrating (1.x to 2.x)

Migrating guide is provided as a list of different cases "before" and "after".

#### Case 1: Inline disable / disable except

Inline comments syntax have not changed, but now you need to specify a processor in ESLint config in order for inline comments to work. Same applies for "except" case.

_source.js_

```js
/* eslint-plugin-disable react */

function greet(name) {
  console.log('Hi, ' + name);
}
```

###### Before

_.eslintrc_

```diff
{
  "plugins": ["import", "react", "jsx-a11y", "disable"],
}
```

###### After

```diff
{
  "plugins": ["import", "react", "jsx-a11y", "disable"],
+ "processor": "disable/disable"
}
```

#### Case 2: Disable file path patterns

Disables specific plugins for specific file path patterns. In new version all paths options have been removed from settings. Using [ESLlint 6+ Overrides](https://eslint.org/docs/user-guide/configuring) from now on (make sure to review the docs for extended configuration options).

###### Before

_.eslintrc_

```diff
{
  "plugins": ["import", "react", "jsx-a11y", "disable"],
- "settings": {
-   "eslint-plugin-disable": {
-     "paths": {
-       "jsx-a11y": ["**/lib/**/*.js"],
-       "react": ["**/app/module/*.service.js", "**/*.test.jsx"],
-       "*": ["config.js"]
-     }
-   }
- }
}
```

###### After

```diff
{
  "plugins": ["import", "react", "jsx-a11y", "disable"],
+ "processor": "disable/disable",
+ "overrides": [
+   {
+     "files": ["lib/**/*.js"],
+     "settings": {
+       "disable/plugins": ["jsx-a11y"],
+     }
+   },
+   {
+     "files": ["app/module/*.service.js", "**/*.test.jsx"],
+     "settings": {
+       "disable/plugins": ["react"]
+     }
+   },
+   {
+     "files": ["config.js"],
+     "settings": {
+       "disable/plugins": "*"
+     }
+   }
+ ]
}
```

#### Case 3: Disable all except file patterns

Disables all registered plugins except the ones specified in settings. In new version all paths options have been removed from settings. Using [ESLlint 6+ Overrides](https://eslint.org/docs/user-guide/configuring) from now on (make sure to review the docs for extended configuration options).

###### Before

_.eslintrc_

```diff
{
  "plugins": ["import", "react", "jsx-a11y", "disable"],
- "settings": {
-   "eslint-plugin-disable": {
-     "allExceptPaths": {
-       "jsx-a11y": ["**/lib/**/*.js"],
-       "react": ["**/app/module/*.service.js", "**/*.test.jsx"]
-     }
-   }
- }
}
```

###### After

```diff
{
  "plugins": ["import", "react", "jsx-a11y", "disable"],
+ "processor": "disable/disable",
+ "overrides": [
+   {
+     "files": ["lib/**/*.js"],
+     "settings": {
+       "disable/disableAllExcept": true,
+       "disable/plugins": ["jsx-a11y"],
+     }
+   },
+   {
+     "files": ["app/module/*.service.js", "**/*.test.jsx"],
+     "settings": {
+       "disable/disableAllExcept": true,
+       "disable/plugins": ["react"]
+     }
+   }
+ ]
}
```

#### Case 4: Using vue-cli-service

Some ESLint plugins also use processors, which creates a conflict with this plugin, because ESLint does not allow to chain processors for the same source files without processing it and producing another files. _"cliArgs"_ have been used to pass extensions and are now replaced with [ESLlint 6+ Overrides](https://eslint.org/docs/user-guide/configuring) so that you can specify which files will be processed. Also hidden integration of conflicting processors now moved to a configurable option _"externalProcessor"_, which accepts a processor identifier _"pluginName/processorName"_ and makes this plugin to call other plugin's processor before disabling the rules.

###### Before

_.eslintrc_

```diff
{
  "extends": [
    "plugin:vue/essential",
    "plugin:vue/strongly-recommended"
  ],
  "plugins": ["disable"],
- "settings": {
-   "eslint-plugin-disable": {
-     "paths": {
-       "vue": ["**/lib/**/*.vue"]
-     },
-     "cliArgs": ["--ext", ".js,.vue"]
-   }
- }
}
```

###### After

```diff
{
  "extends": [
    "plugin:vue/essential",
    "plugin:vue/strongly-recommended"
  ],
  "plugins": ["disable"],
+ "overrides": [
+   {
+     "files": ["lib/**/*.vue"],
+     "processor": "disable/disable",
+     "settings": {
+       "disable/plugins": ["vue"],
+       "disable/externalProcessor": "vue/.vue"
+     }
+   }
+ ]
}
```
