#!/usr/bin/env node

/**
 * On "npm install":
 *
 * - Clone the given `packages` into the subfolders
 * - Run `npm install` in each of the cloned folders
 */

import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";

console.log(process.env.NETLIFY);

const packages = [
  {
    url: "https://github.com/swup/fragment-plugin.git",
    branch: "develop",
    folder: "./packages/fragment-plugin",
  },
  {
    url: "https://github.com/swup/swup.git",
    branch: "next",
    folder: "./packages/swup",
  },
  // {
  //   url: "https://github.com/swup/parallel-plugin.git",
  //   branch: "development",
  //   folder: "./packages/parallel-plugin",
  // },
];

packages.forEach(({ url, branch, folder }) => {
  // Bail early if the folder already exists
  if (existsSync(folder)) return;

  // Always delete the target folders if on Netlify
  if (process.env.NETLIFY) rmSync(folder, { recursive: true, force: true });

  /**
   * Clone the repo into the given folder
   */
  execSync(`git clone ${url} -b ${branch} ${folder}`);
  /**
   * Run `npm install` inside the folder
   * @see https://stackoverflow.com/a/68299198/586823
   */
  if (process.env.NETLIFY) execSync(`npm --prefix ${folder} install`);
});
