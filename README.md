# eslint-plugin-disable [![Build status](https://travis-ci.org/mradionov/eslint-plugin-disable.svg?branch=master)](https://travis-ci.org/mradionov/eslint-plugin-disable)

> Disable ESLint plugins using file path patterns and inline comments

..which means all disabled plugins' errors and warnings won't appear in ESLint report.

- Example: inline comments:

  ```js
  /* eslint-plugin-disable angular */

  function greet(name) {
    console.log('Hi, ' + name);
  }
  ```

- Example: file path patterns (.eslintrc):

  ```js
  {
    "plugins": ["react", "disable"],
    "override": [
      {
        "files": ["tests/**/*.test.js"],
        "processor": "disable/disable"
      },
    ]
  }
  ```

## Install

```bash
npm install eslint-plugin-disable --save-dev
```

## Use

Add plugin to a config file (.eslintrc) and make it default processor:

```diff
{
  "plugins": [
    "react",
    "import"
    "jsx-a11y",
+    "disable"
  ],
+  "processor": "disable/disable"
}
```

#### Inline comments

##### Regular disable

Plugin adds a custom directive to use in files in a form of inline comment, which allows to disable entire plugins for this file. Plugin names have to be the same as in ESLint config file, separated by comma:

```js
/* eslint-plugin-disable react, jsx-a11y */

function greet(name) {
  console.log('Hi, ' + name);
}
```

If no any plugins provided - **all** plugins listed in ESLint config will be disabled:

```js
/* eslint-plugin-disable */

function greet(name) {
  console.log('Hi, ' + name);
}
```

##### Disable all except

Another custom option allows to disable all plugins except ones that are specified. It might be useful when there are a lot of plugins in the project and it is required to use one or two of them for particular files, usage of regular disable syntax might be cumbersome to maintain if there are plans to add new plugins to the project. Plugin names have to be the same as in ESLint config file, separated by comma:

```js
/* eslint-plugin-disable-all-except react, jsx-a11y */

function greet(name) {
  console.log('Hi, ' + name);
}
```

_Notes_:

- disable all except: if no plugins specified, then **none** of the plugins listed in ESLint config will be disabled i.e. error messages will not be removed from ESLint report
- all target files must have a _"disable/disable"_ processor enabled for them, including if you are using [ESLint 6 Overrides](https://eslint.org/docs/user-guide/configuring#specifying-processor) or not
- whitespace inside option block comment is ignored
- original file is not modified
- there is no way to restore behavior with another inline option

#### File paths

##### Regular disable

To disable plugins for file paths use new [ESLint 6+ Overrides](https://eslint.org/docs/user-guide/configuring) feature in config (.eslintrc). It has many different configurations for glob path patterns, ignore patterns and it basically creates a nested config for a list of files ([ESLint docs for more info](https://eslint.org/docs/user-guide/configuring#configuration-based-on-glob-patterns)). This list of files should be assigned with a _"disable/disable"_ processor in order for plugin to work. You can have multiple _"overrides"_ entries with different paths and different plugins to disable.

The following config will disable _"import"_ and _"jsx-a11y"_ plugins for all files matching _"files"_ glob pattern:

```diff
{
  "plugins": ["import", "react", "jsx-a11y", "disable"],
  "overrides": [
    {
      "files": ["tests/**/*.test.js"],
      "processor": "disable/disable",
      "settings": {
        "eslint-plugin-disable": {
          "plugins": ["import", "jsx-a11y"]
        }
      }
    }
  ]
}
```

To disable all registered plugins you can simply skip _"settings"_ at all or use a star:

```diff
{
  "plugins": ["import", "react", "jsx-a11y", "disable"],
  "overrides": [
    {
      "files": ["tests/**/*.test.js"],
      "processor": "disable/disable",
      "settings": {
        "eslint-plugin-disable": {
+          "plugins": "*"
        }
      }
    }
  ]
}
```

##### Disable all except

To disable all plugins except specified ones use `disableAllExcept` flag config settings (.eslintrc).

The following config will disable all registered plugins except "react" for all files mathing "files" glob pattern:

```diff
{
  "plugins": ["import", "react", "jsx-a11y", "disable"],
  "overrides": [
    {
      "files": ["tests/**/*.test.js"],
      "processor": "disable/disable",
      "settings": {
        "eslint-plugin-disable": {
+          "disableAllExcept": true,
          "plugins": ["react"]
        }
      }
    }
  ]
}
```

## Conflicts with other plugins

Some ESLint plugins also use processors, which creates a conflict with this plugin, because ESLint does not allow to chain processors for the same source files without "processing" it and producing another files. There is a setting "externalProcessor", which accepts a processer identifier "pluginName/processorName" and makes this plugin to call other plugin's processor before disabling the rules.

Most popular case is with "eslint-plugin-vue":

```diff
{
  "plugins": ["vue", "disable"],
  "processor": "disable/disable",
  "settings": {
    "eslint-plugin-disable": {
      "plugins": ["vue"],
+      "externalProcessor": "vue/.vue"
    }
  }
}
```

As a plugin might export multiple processors, the only way to find out what "processorName" to use, is to browse plugin's sources. Also, you can skip "processorName" in identifier and only leave "pluginName" - this way first available processor will be auto-picked.

```diff
{
  "plugins": ["vue", "disable"],
  "processor": "disable/disable",
  "settings": {
    "eslint-plugin-disable": {
      "plugins": ["vue"],
+      "externalProcessor": "vue"
-      "externalProcessor": "vue/.vue
    }
  }
}
```

## Option precedence

All the options are not merged together, there is a strict order in which they apply:

1. Inline comment to disable all plugins except specified ([docs](#disable-all-except))
2. Inline comment to disable specified plugins ([docs](#regular-disable))
3. Settings paths to disable all plugins except specified ([docs](#disable-all-except-1))
4. Settings paths to disable specified plugins ([docs](#regular-disable-1))

If first option applies, then only plugins mentioned in this option will be used to disable plugins, the rest of the options down the list will be ignored. If first and second options do not apply (no inline comments in file), but third option does apply, then only plugins mentioned in third option will be used to disable plugins, the rest will be ignored. And so on.

## Support

| eslint           | eslint-plugin-disable |
| ---------------- | --------------------- |
| >= 0.16.0 <6.0.0 | <=1.0.5               |
| >=6.0.0          | >=2.0.0               |

## Origin

Unfortunately this feature is not natively supported in ESLint yet, so this module may become a temporary workaround. Read the following issues for additional information:

- [eslint/eslint - Disable plugin with comments #2118](https://github.com/eslint/eslint/issues/2118)
- [eslint/eslint - Provide means for disabling all rules from a given plugin within a file #3419](https://github.com/eslint/eslint/issues/3419)
- [Gillespie59/eslint-plugin-angular - Don't lint non-angular files #228](https://github.com/Gillespie59/eslint-plugin-angular/issues/228)
