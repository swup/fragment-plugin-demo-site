#!/usr/bin/env node

/**
 * This script could be used when we'd like to deploy
 * this site to a classic VPS using rsync. Steps:
 *
 * - provide an env var RSYNC_PATH, e.g. "user@example.com:/www/htdocs/my-site/"
 * - run this script from the project root
 */

import { exec, execSync } from "child_process";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const { RSYNC_PATH } = process.env;

// Validate env variables
if (!RSYNC_PATH) {
  throw new Error(`"RSYNC_PATH" is not defined.`);
}

// Validate current branch
const branch = execSync("git branch --show", {
  encoding: "utf8",
}).trim();

if (branch !== "master") {
  throw new Error(`Deploying is only possible from the master branch.`);
}

// Deploy
execSync(
  `npm run build && rsync -avz --delete --copy-links ./dist/ ${RSYNC_PATH}`,
  // Print progress to console
  // @see https://stackoverflow.com/a/31104898/586823
  { stdio: "inherit" }
);
