"use strict";

const fs = require("fs");
const path = require("path");
const execa = require("execa");
const Listr = require("listr");
const prettier = require("prettier");
const prettierVersion = require("../package.json").devDependencies.prettier;

if (!prettierVersion) {
  throw new Error("Unable to get Prettier version.");
}

const ROOT = path.join(__dirname, "..");

let hooks;
const hooksFile = path.join(ROOT, ".pre-commit-hooks.yaml");
function updateFiles(version) {
  hooks = hooks || fs.readFileSync(hooksFile, "utf8");
  fs.writeFileSync(
    hooksFile,
    hooks.replace(/- prettier.*\n/, `- prettier@${version}\n`)
  );
}

const git = (command, commandArguments, silence = true) => {
  const subprocess = execa("git", [command, ...commandArguments]);
  return silence ? subprocess.catch(() => {}) : subprocess;
};

(async () => {
  const prefixedVersion = `v${prettierVersion}`;
  const tasks = new Listr([
    {
      title: `Switch to "main" branch`,
      task: () => git("checkout", ["main"], false),
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
      task: () => updateFiles(prettierVersion),
    },
    {
      title: `Commit files`,
      task: () => git("commit", ["-am", prefixedVersion]),
    },
    {
      title: `Push branch`,
      task: () =>
        git("push", [
          "--force",
          "--repo",
          "git@github.com:prettier/pre-commit.git",
        ]),
    },
    {
      title: `Switch back to "main" branch`,
      task: () => git("checkout", ["main"], false),
    },
  ]);

  tasks.run();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
