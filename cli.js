#!/usr/bin/env node

"use strict";

const path = require("path");
const prettierPackageJson = require.resolve("prettier/package.json");
const { bin } = require(prettierPackageJson);
const directory = path.dirname(prettierPackageJson);
const binFile = path.join(
  directory,
  typeof bin === "string" ? bin : bin.prettier
);

require(binFile);
