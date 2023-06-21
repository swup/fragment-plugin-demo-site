import Swup, { Handler } from "swup";
import SwupScrollPlugin from "@swup/scroll-plugin";
import SwupFragmentPluginFromNPM from "@swup/fragment-plugin";
import SwupBodyClassPlugin from "@swup/body-class-plugin";
import SwupPreloadPlugin from "@swup/preload-plugin";

import { isTouch } from "./frontend.js";

import tippy, { followCursor, Placement as TippyPlacement } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

/**
 * Load another version of the fragment plugin in development vs production
 */
const PLUGIN_PATH = process.env.NETLIFY
  ? "@swup/fragment-plugin"
  : "../../../fragment-plugin/src/index.js";
const SwupFragmentPlugin = (await import(PLUGIN_PATH)).default;

// console.log(`current env: ${process.env.NODE_ENV}`);

/** PRINT START **/
const rules = [
  // Rule 1: Between filters of the list
  {
    from: "/characters/:filter?",
    to: "/characters/:filter?",
    fragments: ["#list"],
    name: "replaceCharacters",
  },
  // Rule 2: From the list to an overlay
  {
    from: "/characters/:filter?",
    to: "/character/:character",
    fragments: ["#overlay"],
    name: "openOverlay",
  },
  // Rule 3: From an overlay back to the list
  {
    from: "/character/:character",
    to: "/characters/:filter?",
    fragments: ["#overlay", "#list"],
    name: "closeOverlay",
  },
  // Rule 4: Between overlays
  {
    from: "/character/:character",
    to: "/character/:character",
    fragments: ["#detail"],
    name: "replaceCharacter",
  },
];
/** PRINT END **/

/**
 * Initialize Swup
 */
const swup = new Swup({
  animateHistoryBrowsing: true,
  plugins: [
    new SwupScrollPlugin(),
    new SwupBodyClassPlugin(),
    new SwupPreloadPlugin(),
    new SwupFragmentPlugin({ rules, debug: true }),
  ],
});

/**
 * Make the close URL for overlays dynamic
 * (when clicking 'x' or on the backdrop)
 */
swup.on("contentReplaced", (e) => {
  const closeURL = document
    .querySelector("#list[data-swup-fragment-url]")
    ?.getAttribute("data-swup-fragment-url");
  if (!closeURL) return;
  const closeLinks = [
    ...document.querySelectorAll("a[data-close-overlay]"),
  ] as HTMLAnchorElement[];
  closeLinks.forEach((el) => (el.href = closeURL));
});

/**
 * Tooltips
 */
function initTippy() {
  if (isTouch()) return;

  document.querySelectorAll("[data-tippy]:not(.is-active)").forEach((el) => {
    const content = el.getAttribute("data-tippy");
    if (!content) return;
    tippy(el, {
      allowHTML: true,
      theme: "light",
      content,
      placement:
        (el.getAttribute("data-tippy-placement") as TippyPlacement) || "top",
      plugins: [followCursor],
      followCursor: el.matches("[data-tippy-follow]"),
    });
    el.removeAttribute("data-tippy");
  });
}

/**
 * PageView
 */
function initPageView() {
  initTippy();
}
initPageView();
swup.on("contentReplaced", () => initPageView());

/**
 * Close eventual overlays using the Escape key
 */
const onKeyDown = (e: KeyboardEvent) => {
  if (e.metaKey) return;

  const characterClose = document.querySelector(
    "a.character_close"
  ) as HTMLAnchorElement;

  switch (e.key) {
    case "Escape":
      if (characterClose) characterClose.click();
      break;
  }
};
window.addEventListener("keydown", onKeyDown);
