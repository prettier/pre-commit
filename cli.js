#!/usr/bin/env node

"use strict";

const path = require("path");
const packageJsonFile = require.resolve("prettier/package.json");

const { bin } = require(packageJsonFile);
const directory = path.dirname(packageJsonFile);
const binFile = path.join(
  directory,
  typeof bin === "string" ? bin : bin.prettier
);

require(binFile);
