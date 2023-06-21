import Swup, { Handler } from "swup";
import ScrollPlugin from "@swup/scroll-plugin";
import BodyClassPlugin from "@swup/body-class-plugin";
import PreloadPlugin from "@swup/preload-plugin";

/**
 * Allow to load a development version of fragment plugin:
 *
 * 1. echo "PUBLIC_IMPORT_FRAGMENT_PLUGIN=\"local\"" > .env
 * 2. mkdir packages
 * 3. cd packages
 * 4. git clone git@github.com:swup/fragment-plugin.git
 * 5. npm install
 */
// const PLUGIN_PATH = import.meta.env.NETLIFY
//   ? "@swup/fragment-plugin"
//   : "../../packages/fragment-plugin/src/index.js";

const FragmentPlugin = import.meta.env.NETLIFY
  ? (await import("@swup/fragment-plugin")).default
  : (await import("../../packages/fragment-plugin/src/index.js")).default;

import { isTouch } from "./frontend.js";

import tippy, { followCursor, Placement as TippyPlacement } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

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

/**
 * Initialize Swup
 */
const swup = new Swup({
  animateHistoryBrowsing: true,
  plugins: [
    new ScrollPlugin(),
    new BodyClassPlugin(),
    new PreloadPlugin(),
    new FragmentPlugin({ rules, debug: true }),
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
/** PRINT END **/

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
