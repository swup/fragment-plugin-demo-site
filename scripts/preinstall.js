#!/usr/bin/env node

/**
 * On "npm install":
 *
 * - Clone the given `packages` into the subfolders
 * - Run `npm install` in each of the cloned folders
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

const packages = [
  {
    url: "git@github.com:swup/fragment-plugin.git",
    branch: "develop",
    folder: "./packages/fragment-plugin"
  },
  {
    url: "git@github.com:swup/swup.git",
    branch: "next",
    folder: "./packages/swup"
  }
];

packages.forEach(({url, branch, folder}) => {
  // Bail early if the folder already exists
  if(existsSync(folder)) return;

  /**
   * Clone the repo into the given folder
   */
  execSync(`git clone ${url} -b ${branch} ${folder}`);
  /**
   * Run `npm install` inside the folder
   * @see https://stackoverflow.com/a/68299198/586823
   */
  execSync(`npm --prefix ${folder} install`);
})