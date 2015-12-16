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
        "angular": ["/lib/**/*.js"]
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

*Notes*:

 - whitespace inside option block comment is ignored
 - original file is not modified
 - there is no way to restore behavior with another inline option

#### File paths

To disable plugins for file paths use `paths` option in config settings (.eslintrc). It is an object, where key is a name of the plugin to disable, and value is an array of patterns to match against file name. To target all plugins use `*` as a key.

```js
{
  "settings": {
    "eslint-plugin-disable": {
      "paths": {
        "angular": ["/lib/**/*.js"],
        "react": ["/app/module/*.service.js", "**/*.test.jsx"],
        "*": ["config.js"]
      }
    }
  }
}
```

Take a look at [minimatch](https://github.com/isaacs/minimatch) to learn more about file patterns available for use. To pass custom options to [minimatch](https://github.com/isaacs/minimatch), modify `pathsOptions` setting. `matchBase` option is turned on by default.

 ```js
{
  "settings": {
    "eslint-plugin-disable": {
      "paths": {
        "angular": ["/lib/**/*.js"]
      },
      "pathsOptions": {
        "matchBase": false,
        "noglobstar": true
      }
    }
  }
}
```

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

- 0.2.0 - Disable paths via settings in ESLint config
- 0.1.0 - Disable particular files via inline comments
