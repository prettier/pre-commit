# Prettier support for pre-commit has been moved into <https://github.com/pre-commit/mirrors-prettier>.

# Prettier Mirror

[![Build Status](https://img.shields.io/github/workflow/status/prettier/pre-commit/Test?style=flat-square&label=test)](https://github.com/prettier/pre-commit/actions?query=branch%3Amain+workflow%3ATest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

> Mirror of Prettier package for pre-commit.

- Prettier: <https://github.com/prettier/prettier>
- pre-commit: <https://github.com/pre-commit/pre-commit>

## Usage

> Using Prettier with pre-commit

Add this to your `.pre-commit-config.yaml`:

```yaml
- repo: https://github.com/prettier/pre-commit
  rev: main
  hooks:
    - id: prettier
```

## Versions

If you want use specific version of Prettier, use [`rev`](https://pre-commit.com/#pre-commit-configyaml---repos):

```yaml
- repo: https://github.com/prettier/pre-commit
  # Use the sha or branch you want to point at
  rev: v2.0.0
  hooks:
    - id: prettier
```

All available versions can be found [here](https://github.com/prettier/pre-commit/branches/all).

If you can't find the version you want, please [open an issue](https://github.com/prettier/pre-commit/issues/new?title=Prettier@{{version}}%20is%20missing&labels=bug).
