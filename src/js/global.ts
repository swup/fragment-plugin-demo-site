import Swup, { Handler } from "swup";
// @ts-ignore
import SwupScrollPlugin from "@swup/scroll-plugin";
import SwupFragmentPlugin from "../../../fragment-plugin/src/index.js";
// import SwupFragmentPlugin from "@swup/fragment-plugin";
// @ts-ignore
import SwupBodyClassPlugin from "@swup/body-class-plugin";

import tippy, { followCursor, Placement as TippyPlacement } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

/** PRINT START **/
const rules = [
  // Rule 1: Between filters of the list
  {
    from: "/characters/:filter?",
    to: "/characters/:filter?",
    fragments: ["#overview"],
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
    fragments: ["#overlay", "#overview"],
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
    new SwupScrollPlugin(),
    new SwupBodyClassPlugin(),
    new SwupFragmentPlugin({ rules }),
  ],
});

/**
 * Make the close URL for overlays dynamic
 * (when clicking 'x' or on the backdrop)
 */
swup.on("contentReplaced", (e) => {
  const closeURL = document
    .querySelector("#overview[data-swup-fragment-url]")
    ?.getAttribute("data-swup-fragment-url");
  if (!closeURL) return;
  const closeLinks = [
    ...document.querySelectorAll("a[data-close-overlay]"),
  ] as HTMLAnchorElement[];
  closeLinks.forEach((el) => (el.href = closeURL));
});
/** PRINT END **/
function initTippy() {
  document.querySelectorAll("[data-tippy]:not(.is-active)").forEach((el) => {
    const content = el.getAttribute("data-tippy");
    // const placement =  as  || 'top';
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

function initPageView() {
  initTippy();
}
initPageView();

swup.on("contentReplaced", () => initPageView());



const onKeyDown = (e: KeyboardEvent) => {
  const character = document.querySelector(".character");
  if (!character) return;

  if (e.metaKey) return;

  switch (e.key) {
    case "Escape":
      (
        character.querySelector("a.character_close") as HTMLAnchorElement
      ).click();
      break;
    case "ArrowLeft":
      (
        character.querySelector(
          ".character_nav_link.--previous"
        ) as HTMLAnchorElement
      ).click();
      break;
    case "ArrowRight":
      (
        character.querySelector(
          ".character_nav_link.--next"
        ) as HTMLAnchorElement
      ).click();
      break;
  }
};
window.addEventListener("keydown", onKeyDown);
