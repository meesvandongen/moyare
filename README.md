# Moyare

Monorepo YAML replacer.

## Installation

```bash
bun install moyare
```

## Usage

```bash
moyare
```

## Configuration

For each project in your monorepo, a configuration file can be used. The configuration file can take multiple forms:

- a moyare property in package.json
- a .moyarerc file in JSON or YAML format
- a .moyarerc.json, .moyarerc.yaml, .moyarerc.yml, .moyarerc.js, .moyarerc.ts, .moyarerc.mjs, or .moyarerc.cjs file
- a moyarerc, moyarerc.json, moyarerc.yaml, moyarerc.yml, moyarerc.js, moyarerc.ts, moyarerc.mjs, or moyarerc.cjs file inside a .config subdirectory
- a moyare.config.js, moyare.config.ts, moyare.config.mjs, or moyare.config.cjs file

### Replacements

```json
[
  {
    "file": "path/to/file",
    "replacements": [
      {
        "selector": "my.selector",
        "value": "${packageJson.version}"
      }
    ]
  }
]
```

### Replacement Functions

functions are only supported in JS files.

```js
export default [
  {
    file: "path/to/file",
    replacementFunctions: [
      ({ packageJson, json }) => {
        json.my.selector = packageJson.version;
        return json;
      },
    ],
  },
];
```
