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

async function getVersions() {
  const response = await fetch("https://registry.npmjs.org/prettier");
  const json = await response.json();
  return Object.keys(json.versions).reverse();
}

async function selectVersions(versions) {
  const answers = await prompt({
    type: "multiselect",
    message: "Select version(s) you want create:",
    choices: versions,
    initial: versions,
    limit: 15,
  });

  return Array.isArray(answers) ? answers : [answers];
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
              task: () => execa("git", ["checkout", "main"]),
            },
            {
              title: `Delete "${prefixedVersion}" tag`,
              task: () =>
                execa("git", ["tag", "-d", prefixedVersion]).catch(() => {}),
            },
            {
              title: `Create "${prefixedVersion}" branch`,
              task: () => execa("git", ["branch", prefixedVersion]).catch(() => {}),
            },
            {
              title: `Switch to "${prefixedVersion}" branch`,
              task: () => execa("git", ["checkout", prefixedVersion]),
            },
            {
              title: `Update files`,
              task: () => updateFiles(version),
            },
            {
              title: `Commit files`,
              task: () => execa("git", ["commit", "-am", prefixedVersion]),
            },
            {
              title: `Create "${prefixedVersion}" tag`,
              task: () =>
                execa("git", [
                  "tag",
                  "-a",
                  prefixedVersion,
                  "-m",
                  prefixedVersion,
                ]),
            },
            {
              title: `Switch back to "main" branch`,
              task: () => execa("git", ["checkout", "main"]),
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
