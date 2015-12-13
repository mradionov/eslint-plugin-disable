eslint-plugin-disable
===

> Disable ESLint plugins per file using inline comments

#### Origin

The goal is to add an ability of entirely disabling ESLint plugins for particular JS files via inline comments. Unfortunately this feature is not natively supported in ESLint yet, so this module may become a temporary workaround. Read the following issues for additional information:

- [eslint/eslint - Disable plugin with comments #2118](https://github.com/eslint/eslint/issues/2118)
- [eslint/eslint - Provide means for disabling all rules from a given plugin within a file #3419](https://github.com/eslint/eslint/issues/3419)
- [Gillespie59/eslint-plugin-angular - Don't lint non-angular files #228](https://github.com/Gillespie59/eslint-plugin-angular/issues/228)

#### Install

```bash
npm install eslint-plugin-disable --save-dev
```

#### Use

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

#### Notes

 - whitespace inside option block comment is ignored
 - original file is not modified
 - all error messages for mentioned plugins will be completely removed from the results regardless of their configuration
 - there is no way to restore behavior with another inline option

#### Support

ESLint >= 0.16.0