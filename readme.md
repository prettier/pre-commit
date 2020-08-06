# Prettier Mirror [![Build Status](https://github.com/prettier/pre-commit/workflows/CI/badge.svg?branch=master)](https://github.com/prettier/pre-commit/actions?query=branch%3Amaster+workflow%3ACI)

> Mirror of prettier package for pre-commit.

For Prettier: see <https://github.com/prettier/prettier>

For pre-commit: see <https://github.com/pre-commit/pre-commit>

## Using Prettier with pre-commit

Add this to your `.pre-commit-config.yaml`:

```yaml
- repo: https://github.com/prettier/pre-commit
  hooks:
    - id: prettier
```
