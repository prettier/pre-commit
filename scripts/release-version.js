"use strict";

const fs = require("fs");
const path = require("path");
const execa = require("execa");
const fetch = require("node-fetch");
const Listr = require("listr");
const prompt = require("enquirer").prompt;
const yaml = require("js-yaml");
const prettier = require("prettier");

const ROOT = path.join(__dirname, "..");

const CACHE_FILE = path.join(ROOT, "registry-cache.json");
const CACHE_EXPIRES = 1 * 60 * 60 * 1000;
async function getVersions() {
  try {
    const stat = fs.statSync(CACHE_FILE);
    if (new Date() - stat.ctime < CACHE_EXPIRES) {
      return require(CACHE_FILE);
    }
  } catch {}

  const response = await fetch("https://registry.npmjs.org/prettier");
  const json = await response.json();
  const versions = Object.keys(json.versions).reverse();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(versions, undefined, 2));
  return versions;
}

async function selectVersions(versions) {
  const { selected } = await prompt({
    type: "multiselect",
    name: "selected",
    message: "Select version(s) you want create:",
    choices: versions,
    initial: versions,
    limit: 15,
  });
  return selected;
}

let hooks;
const hooksFile = path.join(ROOT, ".pre-commit-hooks.yaml");
function updateFiles(version) {
  hooks = hooks || fs.readFileSync(hooksFile, "utf8");
  fs.writeFileSync(
    hooksFile,
    hooks.replace(/- prettier.*\n/, `- prettier@${version}`)
  );
}

const git = (command, commandArguments, silence = true) => {
  const subprocess = execa("git", [command, ...commandArguments]);
  return silence ? subprocess.catch(() => {}) : subprocess;
};

(async () => {
  const allVersions = await getVersions();
  let versions = process.argv.slice(2);

  for (const version of versions) {
    if (!allVersions.includes(version)) {
      throw new Error(`Version ${version} is not found.`);
    }
  }

  if (versions.length === 0) {
    versions = await selectVersions(allVersions);
  }

  const tasks = new Listr(
    versions.map((version) => {
      const prefixedVersion = `v${version}`;
      return {
        title: prefixedVersion,
        task: () =>
          new Listr([
            {
              title: `Switch to "main" branch`,
              task: () => git("checkout", ["main"], false),
            },
            {
              title: `Delete "${prefixedVersion}" tag`,
              task: () => git("tag", ["-d", prefixedVersion]),
            },
            {
              title: `Create "${prefixedVersion}" branch`,
              task: () => git("branch", [prefixedVersion]),
            },
            {
              title: `Switch to "${prefixedVersion}" branch`,
              task: () => git("checkout", [prefixedVersion]),
            },
            {
              title: `Update files`,
              task: () => updateFiles(version),
            },
            {
              title: `Commit files`,
              task: () => git("commit", ["-am", prefixedVersion]),
            },
            {
              title: `Create "${prefixedVersion}" tag`,
              task: () => git("tag", ["-a", prefixedVersion]),
            },
            {
              title: `Switch back to "main" branch`,
              task: () => git("checkout", ["main"], false),
            },
          ]),
      };
    })
  );

  tasks.run();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});