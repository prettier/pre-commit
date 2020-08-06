#!/bin/bash

version_package=$(grep '"prettier": "' package.json | sed -n 's/.*"prettier": "\(.*\)"/\1/p')
version_hook=$(grep '\- prettier@' .pre-commit-hooks.yaml | sed -n 's/.*prettier@\(.*\)/\1/p')


echo "Checking if versions in package.json and .pre-commit-hooks.yaml are in sync."

if [ "${version_package}" != "${version_hook}" ]; then
  echo "They are out of sync, please resync them."
  exit 1
else
  echo "They are in sync."
fi
