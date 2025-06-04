#!/usr/bin/env node

// @ts-check

/**
 * On "npm install":
 *
 * - Clone the given `packages` into the subfolders
 * - Run `npm install` in each of the cloned folders
 */

import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";

/** @arg {string} msg */
const info = (msg) => console.log(`🟢 ${msg}`);

info(`Cloning development packages`);

if (!!process.env.NETLIFY) {
  info(`Detected netlify environment`);
}

const packages = [
  {
    url: "https://github.com/swup/fragment-plugin.git",
    branch: "main",
    folder: "./packages/fragment-plugin",
  },
  // {
  //   url: "https://github.com/swup/swup.git",
  //   branch: "main",
  //   folder: "./packages/swup",
  // },
];

packages.forEach(({url, branch, folder}) => {
  /** Bail early if the folder already exists and we are not on Netlify */
  if (!!process.env.NETLIFY && existsSync(folder)) {
    return info(`${url} alrady cloned to ${folder}`);
  }

  /** First, delete the target folder */
  rmSync(folder, { recursive: true, force: true });

  /** Clone the repo into the folder */
  execSync(`git clone ${url} -b ${branch} ${folder}`);

  /**
   * Run `npm install` inside the folder
   * @see https://stackoverflow.com/a/68299198/586823
   */
  execSync(`npm --prefix ${folder} install`);

  info(`Cloned and installed ${url} to ${folder}`);
});
