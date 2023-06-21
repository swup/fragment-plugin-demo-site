import Swup, { Handler } from "swup";
import ScrollPlugin from "@swup/scroll-plugin";
import BodyClassPlugin from "@swup/body-class-plugin";
import PreloadPlugin from "@swup/preload-plugin";
import FragmentPlugin from "@swup/fragment-plugin";
// import FragmentPlugin from "../../packages/fragment-plugin/src/index.js";

import { isTouch } from "./frontend.js";

import tippy, { followCursor, Placement as TippyPlacement } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

/** PRINT START **/
/**
 * Define the rules for Fragment Plugin
 */
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
    new ScrollPlugin(),
    new BodyClassPlugin(),
    new PreloadPlugin(),
    new FragmentPlugin({ rules, debug: true }),
  ],
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
