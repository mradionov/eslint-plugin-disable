eslint-plugin-disable
===

> Disable ESLint plugins using file path patterns and inline comments

- Inline comments:

  ```js
  /* eslint-plugin-disable angular */

  function greet(name) {
    console.log('Hi, ' + name);
  }
  ```

- File path patterns (.eslintrc):

  ```js
  {
    "settings": {
      "eslint-plugin-disable": {
        "paths": {
          "angular": ["**/lib/**/*.js"]
        }
      }
    }
  }
  ```

## Origin

The goal is to add an ability of entirely disabling ESLint plugins for particular JS files via inline comments. Unfortunately this feature is not natively supported in ESLint yet, so this module may become a temporary workaround. Read the following issues for additional information:

- [eslint/eslint - Disable plugin with comments #2118](https://github.com/eslint/eslint/issues/2118)
- [eslint/eslint - Provide means for disabling all rules from a given plugin within a file #3419](https://github.com/eslint/eslint/issues/3419)
- [Gillespie59/eslint-plugin-angular - Don't lint non-angular files #228](https://github.com/Gillespie59/eslint-plugin-angular/issues/228)

## Install

```bash
npm install eslint-plugin-disable --save-dev
```

## Use

Add plugin to a config file (.eslintrc):

```js
{
  "plugins": [
    "angular",
    "disable",  // <--
    "react"
  ]
}
```

#### Inline comments

##### Regular disable

Plugin adds a custom option to use in files in a form of inline comment, which allows to disable entire plugins for this file. Plugin names have to be the same as in ESLint config file, separated by comma:

```js
/* eslint-plugin-disable angular, react */

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

Another custom option allows to disable all plugins except ones that are specified. It might be useful when there are a lot of plugins in the project and it is required to use one-two of them for particular files, usage of regular disable syntax might be more difficult to maintain if there are plans to add new plugins to the project. Plugin names have to be the same as in ESLint config file, separated by comma:

```js
/* eslint-plugin-disable-all-except angular, react */

function greet(name) {
  console.log('Hi, ' + name);
}
```

If no any plugins provided - **none** of the plugins listed in ESLint config will be disabled i.e. error messages will be the same as if this options was not added at all:

```js
/* eslint-plugin-disable-all-except */

function greet(name) {
  console.log('Hi, ' + name);
}
```

*Notes*:

 - whitespace inside option block comment is ignored
 - original file is not modified
 - there is no way to restore behavior with another inline option

#### File paths

##### Regular disable

To disable plugins for file paths use `paths` option in config settings (.eslintrc). It is an object, where key is a name of the plugin to disable, and value is an array of patterns to match against file name. To target all plugins use `*` as a key. Make sure to start paths with `**`, because match is done against absolute path to a file.

```js
{
  "settings": {
    "eslint-plugin-disable": {
      "paths": {
        "angular": ["**/lib/**/*.js"],
        "react": ["**/app/module/*.service.js", "**/*.test.jsx"],
        "*": ["config.js"]
      }
    }
  }
}
```

To disable everything but particular folder you can use path negation.

```js
{
  "settings": {
    "eslint-plugin-disable": {
      "paths": {
        "*": ["*"],
        "angular": ["!**/app/**/*.js"]
      }
    }
  }
}
```

##### Disable all except

To disable all plugins except specified ones for file paths use `allExceptPaths` option in config settings (.eslintrc). It is an object, where key is a name of the plugin to keep (all other plugins will be disabled), and value is an array of patterns to match against file name. For this case `*` does no really make sence in comparison with *Regular disable* ([see above](#regular-disable-1)), so it will be ignored. Make sure to start paths with `**`, because match is done against absolute path to a file.

```js
{
  "settings": {
    "eslint-plugin-disable": {
      "allExceptPaths": {
        "angular": ["**/lib/**/*.js"],
        "react": ["**/app/module/*.service.js", "**/*.test.jsx"]
      }
    }
  }
}
```

##### Paths

Take a look at [minimatch](https://github.com/isaacs/minimatch) to learn more about file patterns available for use. To pass custom options to [minimatch](https://github.com/isaacs/minimatch), modify `pathsOptions` setting. `matchBase` option is turned on by default. These options will be applied to both *Regular disable* ([docs](#regular-disable-1)) and *Disable all except* ([docs](#disable-all-except-1)).

 ```js
{
  "settings": {
    "eslint-plugin-disable": {
      "paths": {
        "angular": ["**/lib/**/*.js"]
      },
      "pathsOptions": {
        "matchBase": false,
        "noglobstar": true
      }
    }
  }
}
```

*Note: Because ESLint uses absolute paths and it is difficult to correctly locate base path of your project from within a plugin, so it is highly suggested to use complete paths to folders you want to disable to leverage the risk of targeting wrong directories and files.*

## Option precedence

All the options are not merged together, it is hard to predict desired behavior and solve all conflicts between file paths and specified plugins, so there is a strict order in which they apply:

1. Inline comment to disable all plugins except specified ([docs](#disable-all-except))
2. Inline comment to disable specified plugins ([docs](#regular-disable))
3. Settings paths to disable all plugins except specified ([docs](#disable-all-except-1))
4. Settings paths to disable specified plugins ([docs](#regular-disable-1))

If first option applies, then only plugins mentioned in this option will be used to disable plugins, the rest of the options down the list will be ignored. If first and second options do not apply (no inline comments in file), but third option does apply, then only plugins mentioned in third option will be used to disable plugins, the rest will be ignored. And so on.

#### Processed extensions

Originally only `.js` and `.jsx` file extensions are processed. In order to use custom extensions, modify `extensions` setting in a config file (.eslintrc).

*Note: default extensions will be overriden, to use them they also have to be mentioned*

```js
{
  "settings": {
    "eslint-plugin-disable": {
      "extensions": [".js", ".ts", ".ps"]
    }
  }
}
```



## Support

ESLint >= 0.16.0

## Changelog

- 0.3.0 - Add option to disable all plugins except specified ones
- 0.2.1 - Prevent crash when ESLint fails to parse a source
- 0.2.0 - Disable paths via settings in ESLint config
- 0.1.0 - Disable particular files via inline comments
